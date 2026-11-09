import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import process from 'node:process';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const targetSkillsDir = path.join(rootDir, '.agents', 'skills');

const REPO_URL = 'https://github.com/mattpocock/skills.git';
const tempDir = path.join(os.tmpdir(), `mattpocock-skills-${Date.now()}`);

console.log('🔄 Fetching latest skills from ' + REPO_URL + '...');

try {
  // 1. Shallow clone to temp directory
  execSync(`git clone --depth 1 ${REPO_URL} "${tempDir}"`, {
    stdio: 'inherit',
  });

  // Read version from cloned package.json
  let version = 'latest';
  const pkgPath = path.join(tempDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      if (pkg.version) version = pkg.version;
    } catch {
      // fallback
    }
  }

  // Ensure target skills directory exists
  fs.mkdirSync(targetSkillsDir, { recursive: true });

  // 2. Discover and flatten skills from category buckets directly into .agents/skills/
  const sourceSkillsDir = path.join(tempDir, 'skills');
  const categories = ['engineering', 'productivity', 'in-progress', 'misc'];
  let count = 0;

  for (const cat of categories) {
    const catDir = path.join(sourceSkillsDir, cat);
    if (!fs.existsSync(catDir)) continue;

    const entries = fs.readdirSync(catDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const srcSkillPath = path.join(catDir, entry.name);
        const skillMdPath = path.join(srcSkillPath, 'SKILL.md');

        if (fs.existsSync(skillMdPath)) {
          const destSkillPath = path.join(targetSkillsDir, entry.name);
          fs.cpSync(srcSkillPath, destSkillPath, { recursive: true });
          count++;
        }
      }
    }
  }

  console.log(
    `✅ Successfully updated ${count} workspace skills (v${version}) in .agents/skills`,
  );
} catch (error) {
  console.error('❌ Failed to update skills:', error.message);
  process.exit(1);
} finally {
  // Cleanup temp dir
  if (fs.existsSync(tempDir)) {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }
}
