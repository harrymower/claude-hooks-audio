import { readFileSync, writeFileSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function convertWebPToPNG() {
  const webpPath = 'D:\\CodingProjects\\claude-hooks-audo\\.product\\icon.webp';
  const pngPath = join(__dirname, 'claude-icon.png');
  
  try {
    // First, let's try to use ImageMagick or similar if available
    try {
      await execAsync(`magick convert "${webpPath}" "${pngPath}"`);
      console.log('Icon converted using ImageMagick');
      return;
    } catch (e) {
      // ImageMagick not available
    }
    
    // Try using ffmpeg if available
    try {
      await execAsync(`ffmpeg -i "${webpPath}" -y "${pngPath}"`);
      console.log('Icon converted using ffmpeg');
      return;
    } catch (e) {
      // ffmpeg not available
    }
    
    // If no converters available, we'll need to install sharp or another converter
    console.log('No image converters found. Installing sharp...');
    await execAsync('npm install sharp');
    
    // Now use sharp to convert
    const sharp = await import('sharp');
    await sharp.default(webpPath)
      .png()
      .toFile(pngPath);
    
    console.log('Icon converted using sharp');
    
  } catch (error) {
    console.error('Error converting icon:', error);
    console.log('\nYou can manually convert the WebP to PNG using:');
    console.log('1. An online converter');
    console.log('2. Paint or other image editor');
    console.log('3. Installing ImageMagick and running: magick convert icon.webp claude-icon.png');
  }
}

convertWebPToPNG();