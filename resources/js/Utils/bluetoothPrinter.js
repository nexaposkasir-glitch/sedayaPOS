/**
 * Bluetooth Thermal Printer Utility
 * Web Bluetooth API + ESC/POS commands
 * Compatible: Chrome Android, Chrome Windows, Edge
 * Flexibel: semua printer thermal Bluetooth (Epson, Goojprt, Munbyn, Rongta, Xprinter, generik ESC/POS)
 */

// Service UUIDs — auto-try in order, majority of thermal printers use 0x18F0 or 0xFF00
const SERVICE_UUIDS = [
    '000018f0-0000-1000-8000-00805f9b34fb',
    '0000ff00-0000-1000-8000-00805f9b34fb',
    '00001101-0000-1000-8000-00805f9b34fb',
];

const CHAR_UUIDS = [
    '00002af0-0000-1000-8000-00805f9b34fb',
    '00002af1-0000-1000-8000-00805f9b34fb',
    '0000ff01-0000-1000-8000-00805f9b34fb',
    '0000ff02-0000-1000-8000-00805f9b34fb',
];

// ── Connection ──────────────────────────────────

let device = null;
let server = null;
let characteristic = null;

export async function connect(deviceName = null) {
    try {
        const options = {
            optionalServices: SERVICE_UUIDS.slice(),
            acceptAllDevices: true,
        };

        if (deviceName) {
            options.filters = [{ name: deviceName }];
        }

        device = await navigator.bluetooth.requestDevice(options);
        device.addEventListener('gattserverdisconnected', onDisconnected);

        server = await device.gatt.connect();
        characteristic = await findCharacteristic(server);

        return { name: device.name, id: device.id };
    } catch (err) {
        console.error('Bluetooth connect failed:', err);
        throw err;
    }
}

function onDisconnected() {
    characteristic = null;
    server = null;
}

export async function autoConnect(deviceId) {
    try {
        const devices = await navigator.bluetooth.getDevices();
        device = devices.find(d => d.id === deviceId);
        if (!device) return false;

        device.addEventListener('gattserverdisconnected', onDisconnected);
        server = await device.gatt.connect();
        characteristic = await findCharacteristic(server);
        return true;
    } catch {
        return false;
    }
}

async function findCharacteristic(gattServer) {
    for (const serviceUuid of SERVICE_UUIDS) {
        try {
            const service = await gattServer.getPrimaryService(serviceUuid);
            for (const charUuid of CHAR_UUIDS) {
                try {
                    const char = await service.getCharacteristic(charUuid);
                    if (char.properties.write || char.properties.writeWithoutResponse) {
                        return char;
                    }
                } catch { /* continue */ }
            }
        } catch { /* continue */ }
    }
    throw new Error('Tidak dapat menemukan karakteristik write pada printer');
}

export async function disconnect() {
    if (device?.gatt?.connected) {
        device.gatt.disconnect();
    }
    device = null;
    server = null;
    characteristic = null;
}

export function isConnected() {
    return !!device?.gatt?.connected;
}

export function getDeviceInfo() {
    if (!device) return null;
    return { name: device.name, id: device.id };
}

// ── ESC/POS Commands ───────────────────────────

const encoder = new TextEncoder();

const ESC = 0x1b;
const GS = 0x1d;

function cmd(...bytes) {
    return new Uint8Array(bytes);
}

function text(str) {
    return encoder.encode(str);
}

// ── Receipt Generator ──────────────────────────

export function generateReceipt(transaction, options = {}) {
    const { paperSize = '80mm', cashDrawer = false, storeProfile = {} } = options;
    const charsPerLine = paperSize === '58mm' ? 32 : 48;
    const parts = [];
    const store = storeProfile || {};
    const details = transaction?.details || [];

    parts.push(cmd(ESC, 0x40)); // init
    parts.push(cmd(ESC, 0x61, 1)); // center
    parts.push(cmd(ESC, 0x21, 0x30)); // double height+width
    parts.push(text(wrapText(store.name || 'SEDAYA POS', charsPerLine)));
    parts.push(cmd(ESC, 0x21, 0x00)); // normal
    parts.push(text('\n'));
    parts.push(cmd(ESC, 0x61, 1)); // center
    parts.push(text(store.address || ''));
    parts.push(text('\n'));
    parts.push(text(store.phone || ''));
    parts.push(text('\n'));
    parts.push(cmd(ESC, 0x61, 0)); // left align
    parts.push(text(lineDash(charsPerLine)));
    parts.push(text('\n'));

    // Date + invoice
    parts.push(text(`No: ${transaction.invoice || ''}`));
    parts.push(text('\n'));
    parts.push(text(formatDate(new Date(transaction.created_at))));
    parts.push(text('\n'));
    parts.push(text(lineDash(charsPerLine)));
    parts.push(text('\n'));

    // Column header
    const colItem = charsPerLine - 26;
    parts.push(cmd(ESC, 0x45, 1)); // bold on
    parts.push(text(padRight('Item', colItem) + padLeft('Qty', 6) + padLeft('Harga', 10) + padLeft('Total', 10)));
    parts.push(cmd(ESC, 0x45, 0)); // bold off
    parts.push(text('\n'));
    parts.push(text(lineDash(charsPerLine)));
    parts.push(text('\n'));

    // Items
    for (const item of details) {
        const productName = item.product?.title || 'Produk';
        const qty = String(item.qty || 1);
        const price = formatNum(item.price / (item.qty || 1));
        const total = formatNum(item.price);

        parts.push(text(truncate(productName, colItem)));
        parts.push(text(padLeft(qty, 6)));
        parts.push(text(padLeft(price, 10)));
        parts.push(text(padLeft(total, 10)));
        parts.push(text('\n'));
    }

    parts.push(text(lineDash(charsPerLine)));
    parts.push(text('\n'));

    // Totals
    parts.push(cmd(ESC, 0x61, 2)); // right align
    parts.push(cmd(ESC, 0x45, 1)); // bold
    parts.push(text(`TOTAL: ${formatNum(transaction.grand_total || 0)}`));
    parts.push(cmd(ESC, 0x45, 0));
    parts.push(text('\n'));

    // Payment info
    parts.push(cmd(ESC, 0x61, 0)); // left
    parts.push(text(`Bayar: ${formatNum(transaction.cash || 0)}`));
    parts.push(text('\n'));
    parts.push(text(`Kembali: ${formatNum(transaction.change || 0)}`));
    parts.push(text('\n'));
    parts.push(text(lineDash(charsPerLine)));
    parts.push(text('\n'));

    parts.push(cmd(ESC, 0x61, 1)); // center
    parts.push(text('Terima Kasih'));
    parts.push(text('\n'));
    parts.push(text('Mudah Kelola - Bisnis Berkembang'));
    parts.push(text('\n\n\n\n'));

    // Cash drawer — only if enabled
    if (cashDrawer) {
        parts.push(cmd(ESC, 0x70, 0, 25, 250));
    }

    // Paper cut
    parts.push(cmd(GS, 0x56, 66, 0));

    return concatArrays(parts);
}

// ── Print Helper ───────────────────────────────

export async function printReceipt(transaction, options = {}) {
    if (!characteristic || !device?.gatt?.connected) {
        throw new Error('Printer tidak terhubung');
    }

    const data = generateReceipt(transaction, options);

    // Send in chunks (Bluetooth MTU ~512 bytes)
    const CHUNK = 256;
    for (let i = 0; i < data.length; i += CHUNK) {
        const chunk = data.slice(i, i + CHUNK);
        try {
            await characteristic.writeValueWithoutResponse(chunk);
        } catch {
            await characteristic.writeValue(chunk);
        }
    }
}

export async function testPrint(storeName = 'SEDAYA POS', paperSize = '80mm') {
    if (!characteristic || !device?.gatt?.connected) {
        throw new Error('Printer tidak terhubung');
    }

    const charsPerLine = paperSize === '58mm' ? 32 : 48;
    const parts = [];

    parts.push(cmd(ESC, 0x40));
    parts.push(cmd(ESC, 0x61, 1));
    parts.push(cmd(ESC, 0x21, 0x30));
    parts.push(text(wrapText(storeName, charsPerLine)));
    parts.push(cmd(ESC, 0x21, 0x00));
    parts.push(text('\n\n'));
    parts.push(cmd(ESC, 0x61, 1));
    parts.push(text('TEST PRINT'));
    parts.push(text('\n'));
    parts.push(text(lineDash(charsPerLine)));
    parts.push(text('\n'));
    parts.push(text('Printer Bluetooth terhubung'));
    parts.push(text('\n'));
    parts.push(text(`Lebar: ${paperSize}`));
    parts.push(text('\n'));
    parts.push(text(lineDash(charsPerLine)));
    parts.push(text('\n'));
    parts.push(cmd(ESC, 0x61, 1));
    parts.push(text('SedayaPOS Ready!'));
    parts.push(text('\n\n\n'));
    parts.push(cmd(GS, 0x56, 66, 0));

    const data = concatArrays(parts);
    const CHUNK = 256;
    for (let i = 0; i < data.length; i += CHUNK) {
        const chunk = data.slice(i, i + CHUNK);
        try {
            await characteristic.writeValueWithoutResponse(chunk);
        } catch {
            await characteristic.writeValue(chunk);
        }
    }
}

// ── Helpers ────────────────────────────────────

function concatArrays(arrays) {
    const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const arr of arrays) {
        result.set(arr, offset);
        offset += arr.length;
    }
    return result;
}

function lineDash(len) {
    return '-'.repeat(len);
}

function truncate(str, max) {
    if (str.length <= max) return str;
    return str.slice(0, max - 1) + '.';
}

function padLeft(str, len) {
    return str.padStart(len);
}

function padRight(str, len) {
    return str.padEnd(len);
}

function wrapText(str, maxLen) {
    if (str.length <= maxLen) return str;
    return str.slice(0, maxLen);
}

function formatNum(num) {
    const n = Number(num || 0);
    return n.toLocaleString('id-ID');
}

function formatDate(date) {
    const d = date || new Date();
    return d.toLocaleString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}
