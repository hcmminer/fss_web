export class DataUtilities {
    static isNullOrEmpty(obj: any) {
        return obj == null || obj === undefined || obj === '';
    }

    static trim(needToTrimString: any) {
        if (needToTrimString == null || needToTrimString == undefined) {
            return "";
        }
        return ('' + needToTrimString).trim();
    }

    static toBase64 = (file: Blob) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    static base64ToArrayBuffer = (base64: any) => {
        const binary_string = window.atob(base64);
        const len = binary_string.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }
}
