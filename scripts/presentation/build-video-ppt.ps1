param(
  [string]$OutputPath = "reports/generated/zening-teng-contribution/video-simple.pptx",
  [string]$PreviewDir = ".build/video-slides"
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "../..")).Path
$outputFull = [System.IO.Path]::GetFullPath((Join-Path $repoRoot $OutputPath))
$previewFull = [System.IO.Path]::GetFullPath((Join-Path $repoRoot $PreviewDir))
$imageFull = Join-Path $repoRoot "reports/generated/zening-teng-contribution/assets/capstone-cartoon.png"

if (-not (Test-Path -LiteralPath $imageFull)) {
  throw "Missing slide illustration: $imageFull"
}

New-Item -ItemType Directory -Path (Split-Path -Parent $outputFull) -Force | Out-Null
New-Item -ItemType Directory -Path $previewFull -Force | Out-Null
Get-ChildItem -LiteralPath $previewFull -Filter "slide-*.png" -File | Remove-Item -Force

$colors = @{
  White = "FFFFFF"
  Ink = "2A1A0E"
  Red = "C8102E"
  Secondary = "545454"
  Border = "D4D4D4"
  Ochre = "C8860E"
}

function Convert-HexColor([string]$Hex) {
  $r = [Convert]::ToInt32($Hex.Substring(0, 2), 16)
  $g = [Convert]::ToInt32($Hex.Substring(2, 2), 16)
  $b = [Convert]::ToInt32($Hex.Substring(4, 2), 16)
  return $r + ($g * 256) + ($b * 65536)
}

function Add-Text {
  param(
    $Slide,
    [double]$X,
    [double]$Y,
    [double]$W,
    [double]$H,
    [string]$Text,
    [string]$Font = "Inter",
    [double]$Size = 21,
    [string]$Color = "Ink",
    [bool]$Bold = $false,
    [int]$Align = 1,
    [int]$VerticalAnchor = 1
  )
  $shape = $Slide.Shapes.AddTextbox(1, $X, $Y, $W, $H)
  $shape.TextFrame.MarginLeft = 0
  $shape.TextFrame.MarginRight = 0
  $shape.TextFrame.MarginTop = 0
  $shape.TextFrame.MarginBottom = 0
  $shape.TextFrame.WordWrap = -1
  $shape.TextFrame.AutoSize = 0
  $shape.TextFrame.VerticalAnchor = $VerticalAnchor
  $shape.TextFrame.TextRange.Text = $Text
  $shape.TextFrame.TextRange.Font.Name = $Font
  $shape.TextFrame.TextRange.Font.Size = $Size
  $shape.TextFrame.TextRange.Font.Bold = $(if ($Bold) { -1 } else { 0 })
  $shape.TextFrame.TextRange.Font.Color.RGB = Convert-HexColor $colors[$Color]
  $shape.TextFrame.TextRange.ParagraphFormat.Alignment = $Align
  return $shape
}

function Add-Box {
  param(
    $Slide,
    [double]$X,
    [double]$Y,
    [double]$W,
    [double]$H,
    [string]$Fill = "White",
    [string]$Line = "Border",
    [double]$LineWeight = 1
  )
  $shape = $Slide.Shapes.AddShape(1, $X, $Y, $W, $H)
  $shape.Fill.Visible = -1
  $shape.Fill.ForeColor.RGB = Convert-HexColor $colors[$Fill]
  $shape.Line.Visible = -1
  $shape.Line.ForeColor.RGB = Convert-HexColor $colors[$Line]
  $shape.Line.Weight = $LineWeight
  return $shape
}

function Add-Arrow {
  param($Slide, [double]$X1, [double]$Y1, [double]$X2, [double]$Y2, [string]$Color = "Ink")
  $line = $Slide.Shapes.AddLine($X1, $Y1, $X2, $Y2)
  $line.Line.ForeColor.RGB = Convert-HexColor $colors[$Color]
  $line.Line.Weight = 2
  $line.Line.EndArrowheadStyle = 3
  return $line
}

function Add-Node {
  param(
    $Slide,
    [double]$X,
    [double]$Y,
    [double]$W,
    [double]$H,
    [string]$Label,
    [string]$Detail = "",
    [string]$Accent = "Ink"
  )
  $null = Add-Box -Slide $Slide -X $X -Y $Y -W $W -H $H -Fill "White" -Line $Accent -LineWeight 1.5
  $null = Add-Text -Slide $Slide -X ($X + 10) -Y ($Y + 12) -W ($W - 20) -H 28 -Text $Label -Font "Inter" -Size 18 -Color "Ink" -Bold $true -Align 2
  if ($Detail) {
    $null = Add-Text -Slide $Slide -X ($X + 8) -Y ($Y + 43) -W ($W - 16) -H 25 -Text $Detail -Font "JetBrains Mono" -Size 12 -Color "Secondary" -Align 2
  }
}

function Add-SlideFrame {
  param($Slide, [int]$Number, [string]$Eyebrow)
  $Slide.FollowMasterBackground = 0
  $Slide.Background.Fill.Solid()
  $Slide.Background.Fill.ForeColor.RGB = Convert-HexColor $colors.White
  $null = Add-Text -Slide $Slide -X 42 -Y 24 -W 360 -H 20 -Text $Eyebrow -Font "Inter" -Size 12 -Color "Secondary" -Bold $true
  $null = Add-Text -Slide $Slide -X 866 -Y 505 -W 52 -H 18 -Text ("0" + $Number) -Font "JetBrains Mono" -Size 11 -Color "Secondary" -Align 3
  $footer = $Slide.Shapes.AddLine(42, 496, 918, 496)
  $footer.Line.ForeColor.RGB = Convert-HexColor $colors.Border
  $footer.Line.Weight = 0.75
}

function Set-SpeakerNotes {
  param($Slide, [string]$Notes)
  $notesPage = $Slide.NotesPage
  $written = $false
  for ($index = 1; $index -le $notesPage.Shapes.Count; $index += 1) {
    $shape = $notesPage.Shapes.Item($index)
    try {
      if ($shape.PlaceholderFormat.Type -eq 2) {
        $shape.TextFrame.TextRange.Text = $Notes
        $written = $true
        break
      }
    } catch {
      continue
    }
  }
  if (-not $written) {
    throw "PowerPoint notes placeholder was not found on slide $($Slide.SlideIndex)."
  }
}

$powerPoint = $null
$presentation = $null
try {
  $powerPoint = New-Object -ComObject PowerPoint.Application
  $powerPoint.Visible = -1
  $presentation = $powerPoint.Presentations.Add()
  $presentation.PageSetup.SlideWidth = 960
  $presentation.PageSetup.SlideHeight = 540

  # Slide 1 — two-module overview
  $slide1 = $presentation.Slides.Add(1, 12)
  Add-SlideFrame -Slide $slide1 -Number 1 -Eyebrow "CAPSTONE CONTRIBUTION"
  $null = Add-Text -Slide $slide1 -X 42 -Y 57 -W 870 -H 58 -Text "I built two checks" -Font "EB Garamond" -Size 42 -Color "Ink"
  $accent = $slide1.Shapes.AddLine(42, 124, 138, 124)
  $accent.Line.ForeColor.RGB = Convert-HexColor $colors.Red
  $accent.Line.Weight = 4
  $null = Add-Text -Slide $slide1 -X 42 -Y 141 -W 700 -H 32 -Text "Read the PDF. A correct stop is success." -Font "Inter" -Size 21 -Color "Secondary"
  $picture = $slide1.Shapes.AddPicture($imageFull, 0, -1, 140, 176, 680, 270)
  $picture.AlternativeText = "Minimal cartoon showing a resume scanner and two independently closed checkpoint gates."
  $null = Add-Text -Slide $slide1 -X 425 -Y 244 -W 120 -H 24 -Text "LIVENESS" -Font "JetBrains Mono" -Size 13 -Color "Red" -Bold $true -Align 2
  $null = Add-Text -Slide $slide1 -X 615 -Y 244 -W 120 -H 24 -Text "TIMELINE" -Font "JetBrains Mono" -Size 13 -Color "Red" -Bold $true -Align 2
  $null = Add-Text -Slide $slide1 -X 155 -Y 446 -W 260 -H 28 -Text "ATS paste-test" -Font "Inter" -Size 18 -Color "Ink" -Bold $true -Align 2
  $null = Add-Text -Slide $slide1 -X 466 -Y 446 -W 370 -H 28 -Text "Either zero → correct Skip" -Font "Inter" -Size 18 -Color "Red" -Bold $true -Align 2
  Set-SpeakerNotes -Slide $slide1 -Notes @"
Hi, I'm Zening Teng. I built two checks for The Reallocation Engine. The ATS paste-test checks whether a PDF exposes readable text. The gate harness checks that liveness and timeline remain hard stops. These tools verify software behavior. They do not make the final application decision.
"@

  # Slide 2 — one hard-stop rule
  $slide2 = $presentation.Slides.Add(2, 12)
  Add-SlideFrame -Slide $slide2 -Number 2 -Eyebrow "SUCCESS CAN MEAN STOPPING"
  $null = Add-Text -Slide $slide2 -X 42 -Y 57 -W 870 -H 66 -Text "A correct Skip is success" -Font "EB Garamond" -Size 42 -Color "Ink"
  $accent2 = $slide2.Shapes.AddLine(42, 132, 138, 132)
  $accent2.Line.ForeColor.RGB = Convert-HexColor $colors.Red
  $accent2.Line.Weight = 4

  $null = Add-Text -Slide $slide2 -X 120 -Y 184 -W 720 -H 54 -Text "Liveness = 0    →    Skip" -Font "JetBrains Mono" -Size 31 -Color "Ink" -Bold $true -Align 2
  $null = Add-Text -Slide $slide2 -X 120 -Y 274 -W 720 -H 54 -Text "Timeline = 0    →    Skip" -Font "JetBrains Mono" -Size 31 -Color "Ink" -Bold $true -Align 2

  $null = Add-Text -Slide $slide2 -X 120 -Y 370 -W 720 -H 46 -Text "2 / 2 wrong Apply results caught" -Font "Inter" -Size 22 -Color "Red" -Bold $true -Align 2
  $null = Add-Text -Slide $slide2 -X 120 -Y 446 -W 720 -H 30 -Text "Success here means the role did not pass the gate." -Font "Inter" -Size 16 -Color "Secondary" -Align 2
  Set-SpeakerNotes -Slide $slide2 -Notes @"
In this project, Skip is not a failed run. It is the correct result when a hard gate is zero. If liveness is zero, the result must be Skip. If timeline is zero, the result must also be Skip. I deliberately ran two bad-code cases that returned Apply, and the harness caught both wrong results. Two out of two is a controlled test result, not a real job score. The tools still cannot prove every commercial ATS, current job liveness, my legal timeline, or the final application decision.
"@

  $presentation.SaveAs($outputFull, 24)
  foreach ($slide in @($slide1, $slide2)) {
    $previewPath = Join-Path $previewFull ("slide-{0}.png" -f $slide.SlideIndex)
    $slide.Export($previewPath, "PNG", 1920, 1080)
  }
} finally {
  if ($presentation) {
    $presentation.Close()
    [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($presentation)
  }
  if ($powerPoint) {
    $powerPoint.Quit()
    [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($powerPoint)
  }
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}

Write-Output "PPT: $outputFull"
Write-Output "Previews: $previewFull"
