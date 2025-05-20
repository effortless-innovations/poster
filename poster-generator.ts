import { createCanvas, loadImage, registerFont, Canvas, CanvasRenderingContext2D } from "canvas";
import { join } from "node:path";
import { write, file, mkdir } from "bun";

// 定义海报配置接口
interface PosterConfig {
  width?: number;
  height?: number;
  backgroundColor?: string;
  backgroundImageUrl?: string | null;
  title?: string;
  titleColor?: string;
  titleFont?: string;
  subtitle?: string;
  subtitleColor?: string;
  subtitleFont?: string;
  content?: string;
  contentColor?: string;
  contentFont?: string;
  outputPath?: string;
}

// 创建存放字体和输出文件的目录
const FONTS_DIR: string = join(import.meta.dir, "fonts");
const IMAGES_DIR: string = join(import.meta.dir, "images");
const OUTPUT_DIR: string = join(import.meta.dir, "output");

// 确保目录存在
try { mkdir(FONTS_DIR, { recursive: true }); } catch {}
try { mkdir(IMAGES_DIR, { recursive: true }); } catch {}
try { mkdir(OUTPUT_DIR, { recursive: true }); } catch {}

async function generatePoster({
  width = 1200,
  height = 630,
  backgroundColor = "#2a2a2a",
  backgroundImageUrl = null,
  title = "精彩海报标题",
  titleColor = "#ffffff",
  titleFont = "bold 60px 'Noto Sans SC'",
  subtitle = "引人注目的副标题内容",
  subtitleColor = "#f5f5f5",
  subtitleFont = "normal 36px 'Noto Sans SC'",
  content = "海报正文内容，可以包含多行文字描述。",
  contentColor = "#e0e0e0",
  contentFont = "normal 24px 'Noto Sans SC'",
  outputPath = join(OUTPUT_DIR, "poster.png")
}: PosterConfig): Promise<string> {
  // 注册字体
  registerFont(join(FONTS_DIR, "NotoSansSC-Regular.ttf"), { family: "Noto Sans SC" });
  registerFont(join(FONTS_DIR, "NotoSansSC-Bold.ttf"), { family: "Noto Sans SC", weight: "bold" });

  // 创建画布
  const canvas: Canvas = createCanvas(width, height);
  const ctx: CanvasRenderingContext2D = canvas.getContext("2d");

  // 绘制背景色
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  // 如果有背景图片，则绘制背景图片
  if (backgroundImageUrl) {
    try {
      const backgroundImage = await loadImage(backgroundImageUrl);
      
      // 计算保持宽高比的缩放
      const scale: number = Math.max(width / backgroundImage.width, height / backgroundImage.height);
      const scaledWidth: number = backgroundImage.width * scale;
      const scaledHeight: number = backgroundImage.height * scale;
      
      // 居中绘制背景图片
      const x: number = (width - scaledWidth) / 2;
      const y: number = (height - scaledHeight) / 2;
      
      ctx.drawImage(backgroundImage, x, y, scaledWidth, scaledHeight);
      
      // 添加半透明遮罩以提高文字可读性
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, width, height);
    } catch (error) {
      console.error("背景图片加载失败:", error);
    }
  }

  // 绘制标题
  ctx.font = titleFont;
  ctx.fillStyle = titleColor;
  ctx.textAlign = "center";
  ctx.fillText(title, width / 2, height / 3);

  // 绘制副标题
  ctx.font = subtitleFont;
  ctx.fillStyle = subtitleColor;
  ctx.fillText(subtitle, width / 2, height / 2);

  // 绘制内容（支持多行）
  ctx.font = contentFont;
  ctx.fillStyle = contentColor;
  const contentLines: string[] = content.split("\n");
  const lineHeight: number = 36; // 行高
  let y: number = height / 1.5;
  
  for (const line of contentLines) {
    ctx.fillText(line, width / 2, y);
    y += lineHeight;
  }

  // 保存图片
  const buffer: Buffer = canvas.toBuffer("image/png");
  await write(outputPath, buffer);
  
  console.log(`海报已保存到: ${outputPath}`);
  return outputPath;
}

// 使用示例
async function main(): Promise<void> {
  try {
    // 基本海报示例
    await generatePoster({
      title: "2025年科技峰会",
      subtitle: "探索未来科技与创新的可能性",
      content: "日期: 2025年6月15-18日\n地点: 上海国际会展中心\n报名方式: www.techsummit2025.example.com"
    });
    
    // 带背景图片的海报示例
    await generatePoster({
      backgroundImageUrl: "./images/bg.jpg",
      title: "夏日音乐节",
      subtitle: "来自全球的顶尖音乐人",
      content: "2025年7月10-12日\n阳光海滩公园\n门票预售进行中",
      backgroundColor: "#000066", // 备用背景色
      outputPath: join(OUTPUT_DIR, "music-festival.png")
    });
    
  } catch (error) {
    console.error("生成海报时出错:", error);
  }
}

main();