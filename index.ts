// const { program } = require('commander');
import { program } from 'commander';
import fs from 'fs';
import path from 'path';
import { pascalCase } from "change-case";

/**
 * 指定したディレクトリ内の特定ファイルを再帰的に結合する
 * @param dir ディレクトリ
 * @param type ファイルの拡張子
 */
const concatFiles = async ({
  dir,
  type,
}: {
  dir: string;
  type: string;
}) => {
  // ...
  // 絶対パスに変換
  const absolutePath = fs.realpathSync(dir);

  const listFiles = async (dir: string): Promise<string[]> => {
    const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      dirents.map((dirent) => {
        const res = path.resolve(dir, dirent.name);
        return dirent.isDirectory() ? listFiles(res) : res;
      })
    );
    return Array.prototype.concat(...files);
  }

  // ディレクトリ以下のファイルを全階層取得
  const files = await listFiles(absolutePath);
  // 拡張子が一致するファイルのみを抽出
  const targetFiles = files.filter((file) => file.endsWith(type));

  if (targetFiles.length === 0) {
    console.error('No files found.');
    return;
  }

  // console.log('Files found:', JSON.stringify(targetFiles, null, 2));

  // 3ms毎に見つかったファイル名をひとつずつ表示
  for (const file of targetFiles) {
    console.log(file);
    await new Promise((resolve) => setTimeout(resolve, 3));
  }

  // ファイルを結合
  const contents = await Promise.all(
    targetFiles.map(async (file) => {
      const content = await fs.promises.readFile(file, 'utf-8');
      return `
# ${file}
\`\`\`
${content}
\`\`\`
`;
    })
  ).then((contents) => contents.join('\n'));

  // 出力ファイル名を生成
  const fileName = `${pascalCase(dir).replace(/[^a-zA-Z0-9]/g, '')}.${type}.${Date.now()}.md`;
  fs.mkdirSync('./output', { recursive: true });
  console.log("\n", '👉 Output:', fileName);
    // contentsの行数を表示, 3桁ごとにカンマ区切り
  console.log('Total lines:', contents.split('\n').length.toLocaleString());
  // ファイル容量を表示, 3桁ごとにカンマ区切り
  const size = Buffer.byteLength(contents, 'utf-8')/1000;
  console.log('File size:', size.toLocaleString(), 'KB');
  const output = `./output/${fileName}`;
  await fs.promises.writeFile(output, contents);
}

program
  .action(concatFiles)
  .description('Concatenate files in a directory')
  .requiredOption('-d, --dir <dir>', 'a directory')
  .requiredOption('-t, --type <type>', 'a file type')

program.parse();
