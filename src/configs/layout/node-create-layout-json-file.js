
import fs from 'node:fs';
import path from 'node:path';

function createLayoutJsonFile(layouts) {
  const folderPath = path.join('./modules');

  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath);

  // 根据 layouts 对象生成 JSON 文件
  for (const [key, value] of Object.entries(layouts)) {
    const filePath = path.join(folderPath, `${key}.json`);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf-8');
  }
}

export default createLayoutJsonFile;
