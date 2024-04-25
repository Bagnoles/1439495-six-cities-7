import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Command } from './command.interface.js';


export class VersionCommand implements Command {
  constructor(
    private readonly filePath: string = 'package.json'
  ) {}

  private readVersion(): string {
    const fileContent = JSON.parse(readFileSync(resolve(this.filePath), 'utf-8'));
    return fileContent.version;
  }

  public getName(): string {
    return '--version';
  }

  public async execute(..._parameters: string[]): Promise<void> {
    try {
      const version = this.readVersion();
      console.info(version);
    } catch (error) {
      console.error(`Ошибка чтения версии программы из файла ${this.filePath}`);
    }
  }
}
