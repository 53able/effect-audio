import { program } from 'commander';
import fs from 'fs';
import path from 'path';
import { pascalCase } from "change-case";
import { Minimatch } from'minimatch';
import {
  encode,
} from 'gpt-tokenizer'


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
  type?: string;
}) => {
  // ...
  // 絶対パスに変換
  const absolutePath = fs.realpathSync(dir);

  // ディレクトリ以下のファイルを再帰的に取得
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

  let ignoreFilesRegExps: RegExp[] = [];
  try {
    // .gitignoreファイルを読み込み、無視するファイルを除外
    const gitignore = await fs.promises
      .readFile(path.join(absolutePath, '.gitignore'), 'utf-8');
    ignoreFilesRegExps = gitignore.split('\n')
      .filter((line) => line.trim() !== '')
      .filter((line) => !line.startsWith('#'))
      .map(glob => {
          const regexp = new Minimatch(glob).makeRe();
          if (!regexp) throw new Error(`globに変換できません。glob: "${glob}"`);
          return regexp
        });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }

  // 無視するファイルを除外
  const filteredFiles = files.filter((file) => !ignoreFilesRegExps.some((regexp: RegExp) => {
    const _file = path.relative(absolutePath, file).split("/");
    return _file.some((f) => regexp.test(f));
  }))
  // 画像を除外
  .filter((file) => !/\.(png|jpe?g|gif|svg|webp|ico|bmp|tiff|psd|raw|heif|indd|ai|eps|pdf|xcf|sketch|fig|xd)$/i.test(file));

    // 拡張子が一致するファイルのみを抽出
  const targetFiles = type ?  filteredFiles.filter((file) => file.endsWith(type)) : filteredFiles;

  // ファイルが見つからない場合はエラーを表示
  if (targetFiles.length === 0) {
    console.error('No files found.');
    return;
  }

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
  const fileName = `${pascalCase(dir).replace(/[^a-zA-Z0-9]/g, '')}${type ? `.${type}` : ''}.${Date.now()}.md`;
  fs.mkdirSync('./output', { recursive: true });
  console.log("\n", '👉 Output:', fileName);
    // contentsの行数を表示, 3桁ごとにカンマ区切り
  console.log('Total lines:', contents.split('\n').length.toLocaleString());
  // ファイル容量を表示, 3桁ごとにカンマ区切り
  const size = Buffer.byteLength(contents, 'utf-8')/1000;
  console.log('File size:', size.toLocaleString(), 'KB');
  // トークン数を表示, 3桁ごとにカンマ区切り
  const tokens = encode(contents).length;
  console.log('Tokens:', tokens.toLocaleString());

  const output = `./output/${fileName}`;

  // 200,000トークンを超える場合はエラーを表示
  if (tokens > 200000) {
    console.error('🚨 200,000 tokens exceeded.');
    const chunks = contents.match(/[\s\S]{1,200000}/g);
    if (!chunks) throw new Error('chunksが見つかりません。');
    for (let i = 0; i < chunks.length; i++) {
      await fs.promises.writeFile(output.replace('.md', `-${i + 1}.md`), chunks[i]);
    }
    return;
  }
  await fs.promises.writeFile(output, contents);
}

program
  .action(concatFiles)
  .description('Concatenate files in a directory')
  .requiredOption('-d, --dir <dir>', 'a directory')
  .option('-t, --type <type>', 'a file type', undefined)

program.parse();
