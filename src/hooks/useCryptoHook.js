import CryptoJS from 'crypto-js';

export const useCryptoHook = () => {
    // 加密数据
    function encryptData(jsonData, password) {
        try {
            const jsonString = JSON.stringify(jsonData);
            const encrypted = CryptoJS.AES.encrypt(jsonString, password).toString();
            return encrypted;
        } catch (error) {
            throw new Error('加密失败: ' + error.message);
        }
    }

    // 解密数据
    function decryptData(encryptedData, password) {
        try {
            const { valid, data } = validateEncryptedConfig(encryptedData);
            if (!valid) {
                throw new Error(data.error);
            }

            const decrypted = CryptoJS.AES.decrypt(data, password);
            const jsonString = decrypted.toString(CryptoJS.enc.Utf8);

            if (!jsonString) {
                throw new Error('解密失败，密码可能不正确');
            }

            return JSON.parse(jsonString);
        } catch (error) {
            throw new Error('解密失败: ' + error.message);
        }
    }

    // 验证导入的加密配置文件格式
    function validateEncryptedConfig(content) {
        try {
            const encryptedString = content;

            // 2. 检查是否为字符串类型
            if (typeof encryptedString !== 'string') {
                return { valid: false, error: '配置文件格式不正确：应为加密字符串' };
            }

            // 3. 检查字符串是否为空
            if (!encryptedString.trim()) {
                return { valid: false, error: '配置文件内容为空' };
            }

            // 4. 检查是否为Base64格式（可选，但建议）
            // Base64字符串通常只包含 A-Z, a-z, 0-9, +, /, = 字符
            const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
            if (!base64Regex.test(encryptedString)) {
                return { valid: false, error: '配置文件格式不正确：不是有效的加密格式' };
            }

            return { valid: true, data: encryptedString };
        } catch (error) {
            return { valid: false, error: '配置文件不是有效的JSON格式' };
        }
    }

  return {
    encryptData,
      decryptData,
      validateEncryptedConfig
  };
}