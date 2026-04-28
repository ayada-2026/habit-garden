Add-Type -AssemblyName System.Drawing

function New-RoundedRectPath {
  param(
    [float]$X,
    [float]$Y,
    [float]$Width,
    [float]$Height,
    [float]$Radius
  )

  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $diameter = $Radius * 2

  $path.AddArc($X, $Y, $diameter, $diameter, 180, 90)
  $path.AddArc($X + $Width - $diameter, $Y, $diameter, $diameter, 270, 90)
  $path.AddArc($X + $Width - $diameter, $Y + $Height - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($X, $Y + $Height - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()

  return $path
}

function Save-ResizedPng {
  param(
    [System.Drawing.Bitmap]$Source,
    [int]$Size,
    [string]$OutPath
  )

  $bitmap = New-Object System.Drawing.Bitmap $Size, $Size
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $graphics.Clear([System.Drawing.Color]::Transparent)
  $graphics.DrawImage($Source, 0, 0, $Size, $Size)
  $bitmap.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose()
  $bitmap.Dispose()
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = Split-Path -Parent $scriptDir
$iconDir = Join-Path $projectDir "assets\icons"

if (-not (Test-Path $iconDir)) {
  New-Item -ItemType Directory -Path $iconDir | Out-Null
}

$size = 1024
$canvas = New-Object System.Drawing.Bitmap $size, $size
$graphics = [System.Drawing.Graphics]::FromImage($canvas)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

$bgColorTop = [System.Drawing.Color]::FromArgb(255, 250, 244, 234)
$bgColorBottom = [System.Drawing.Color]::FromArgb(255, 244, 237, 224)
$graphics.Clear($bgColorBottom)

$fullRect = New-Object System.Drawing.RectangleF 0, 0, $size, $size
$bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $fullRect, $bgColorTop, $bgColorBottom, 90
$graphics.FillRectangle($bgBrush, $fullRect)

$mintGlowBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(72, 188, 231, 211))
$warmGlowBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(64, 255, 221, 189))
$graphics.FillEllipse($mintGlowBrush, 120, 500, 620, 420)
$graphics.FillEllipse($warmGlowBrush, 520, 90, 320, 260)

$plateShadowPath = New-RoundedRectPath -X 128 -Y 128 -Width 768 -Height 768 -Radius 210
$plateShadowBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(26, 120, 95, 66))
$shadowMatrix = New-Object System.Drawing.Drawing2D.Matrix
$shadowMatrix.Translate(0, 18)
$plateShadowPath.Transform($shadowMatrix)
$graphics.FillPath($plateShadowBrush, $plateShadowPath)

$platePath = New-RoundedRectPath -X 128 -Y 118 -Width 768 -Height 768 -Radius 210
$plateBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush (
  (New-Object System.Drawing.RectangleF 128, 118, 768, 768),
  [System.Drawing.Color]::FromArgb(245, 255, 250, 242),
  [System.Drawing.Color]::FromArgb(250, 255, 253, 249),
  90
)
$graphics.FillPath($plateBrush, $platePath)
$platePen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(54, 255, 255, 255), 3)
$graphics.DrawPath($platePen, $platePath)

$centerX = 512
$baseY = 650

$stemPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 89, 155, 124), 32)
$stemPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$stemPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$stemPath = New-Object System.Drawing.Drawing2D.GraphicsPath
$stemPath.AddBezier(
  (New-Object System.Drawing.Point -ArgumentList 510, 672),
  (New-Object System.Drawing.Point -ArgumentList 496, 622),
  (New-Object System.Drawing.Point -ArgumentList 522, 560),
  (New-Object System.Drawing.Point -ArgumentList 514, 504)
)
$graphics.DrawPath($stemPen, $stemPath)

function New-LeafPath {
  param(
    [System.Drawing.PointF]$Start,
    [System.Drawing.PointF]$Control1,
    [System.Drawing.PointF]$Tip,
    [System.Drawing.PointF]$Control2,
    [System.Drawing.PointF]$End
  )

  $leafPath = New-Object System.Drawing.Drawing2D.GraphicsPath
  $leafPath.AddBezier($Start, $Control1, $Tip, $Tip)
  $leafPath.AddBezier($Tip, $Tip, $Control2, $End)
  $leafPath.CloseFigure()
  return $leafPath
}

$leftLeaf = New-LeafPath `
  -Start (New-Object System.Drawing.PointF -ArgumentList 502, 560) `
  -Control1 (New-Object System.Drawing.PointF -ArgumentList 430, 546) `
  -Tip (New-Object System.Drawing.PointF -ArgumentList 350, 478) `
  -Control2 (New-Object System.Drawing.PointF -ArgumentList 428, 432) `
  -End (New-Object System.Drawing.PointF -ArgumentList 512, 514)

$rightLeaf = New-LeafPath `
  -Start (New-Object System.Drawing.PointF -ArgumentList 526, 546) `
  -Control1 (New-Object System.Drawing.PointF -ArgumentList 612, 530) `
  -Tip (New-Object System.Drawing.PointF -ArgumentList 688, 462) `
  -Control2 (New-Object System.Drawing.PointF -ArgumentList 624, 424) `
  -End (New-Object System.Drawing.PointF -ArgumentList 520, 500)

$topLeaf = New-LeafPath `
  -Start (New-Object System.Drawing.PointF -ArgumentList 510, 500) `
  -Control1 (New-Object System.Drawing.PointF -ArgumentList 488, 478) `
  -Tip (New-Object System.Drawing.PointF -ArgumentList 502, 430) `
  -Control2 (New-Object System.Drawing.PointF -ArgumentList 544, 444) `
  -End (New-Object System.Drawing.PointF -ArgumentList 524, 496)

$leafBrushLeft = New-Object System.Drawing.Drawing2D.LinearGradientBrush (
  (New-Object System.Drawing.RectangleF 340, 430, 190, 140),
  [System.Drawing.Color]::FromArgb(255, 148, 214, 182),
  [System.Drawing.Color]::FromArgb(255, 84, 160, 124),
  45
)
$leafBrushRight = New-Object System.Drawing.Drawing2D.LinearGradientBrush (
  (New-Object System.Drawing.RectangleF 502, 420, 198, 148),
  [System.Drawing.Color]::FromArgb(255, 165, 226, 195),
  [System.Drawing.Color]::FromArgb(255, 76, 151, 116),
  135
)
$leafBrushTop = New-Object System.Drawing.Drawing2D.LinearGradientBrush (
  (New-Object System.Drawing.RectangleF 476, 424, 76, 96),
  [System.Drawing.Color]::FromArgb(255, 188, 236, 207),
  [System.Drawing.Color]::FromArgb(255, 91, 165, 128),
  90
)

$leafShadowBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(24, 64, 116, 94))
$shadowTranslate = New-Object System.Drawing.Drawing2D.Matrix
$shadowTranslate.Translate(0, 14)

$leftLeafShadow = $leftLeaf.Clone()
$leftLeafShadow.Transform($shadowTranslate)
$graphics.FillPath($leafShadowBrush, $leftLeafShadow)

$rightLeafShadow = $rightLeaf.Clone()
$rightLeafShadow.Transform($shadowTranslate)
$graphics.FillPath($leafShadowBrush, $rightLeafShadow)

$topLeafShadow = $topLeaf.Clone()
$topLeafShadow.Transform($shadowTranslate)
$graphics.FillPath($leafShadowBrush, $topLeafShadow)

$graphics.FillPath($leafBrushLeft, $leftLeaf)
$graphics.FillPath($leafBrushRight, $rightLeaf)
$graphics.FillPath($leafBrushTop, $topLeaf)

$leafVeinPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(42, 255, 255, 255), 6)
$leafVeinPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$leafVeinPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$graphics.DrawLine($leafVeinPen, 454, 530, 388, 480)
$graphics.DrawLine($leafVeinPen, 576, 520, 650, 474)
$graphics.DrawLine($leafVeinPen, 512, 486, 504, 442)

$seedBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 230, 205, 168))
$graphics.FillEllipse($seedBrush, $centerX - 22, $baseY + 24, 44, 18)

$baseGlowBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(28, 158, 221, 192))
$graphics.FillEllipse($baseGlowBrush, 388, 646, 248, 84)

$base1024 = Join-Path $iconDir "icon-1024.png"
$canvas.Save($base1024, [System.Drawing.Imaging.ImageFormat]::Png)

Save-ResizedPng -Source $canvas -Size 512 -OutPath (Join-Path $iconDir "icon-512.png")
Save-ResizedPng -Source $canvas -Size 192 -OutPath (Join-Path $iconDir "icon-192.png")
Save-ResizedPng -Source $canvas -Size 180 -OutPath (Join-Path $iconDir "apple-touch-icon.png")
Save-ResizedPng -Source $canvas -Size 64 -OutPath (Join-Path $iconDir "favicon-64.png")
Save-ResizedPng -Source $canvas -Size 32 -OutPath (Join-Path $iconDir "favicon-32.png")

$graphics.Dispose()
$canvas.Dispose()
$bgBrush.Dispose()
$mintGlowBrush.Dispose()
$warmGlowBrush.Dispose()
$plateShadowBrush.Dispose()
$plateBrush.Dispose()
$platePen.Dispose()
$stemPen.Dispose()
$leafBrushLeft.Dispose()
$leafBrushRight.Dispose()
$leafBrushTop.Dispose()
$leafShadowBrush.Dispose()
$leafVeinPen.Dispose()
$seedBrush.Dispose()
$baseGlowBrush.Dispose()
$plateShadowPath.Dispose()
$platePath.Dispose()
$stemPath.Dispose()
$leftLeaf.Dispose()
$rightLeaf.Dispose()
$topLeaf.Dispose()
$leftLeafShadow.Dispose()
$rightLeafShadow.Dispose()
$topLeafShadow.Dispose()
