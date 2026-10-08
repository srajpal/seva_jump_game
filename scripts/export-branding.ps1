# Mechanical platform-size exports from the reviewed image-generation masters.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = Split-Path $PSScriptRoot -Parent
function Export-Icon([string]$source, [string]$destination, [int]$size) {
  $inputImage = [Drawing.Image]::FromFile((Join-Path $root $source))
  $bitmap = New-Object Drawing.Bitmap($size, $size, ([Drawing.Imaging.PixelFormat]::Format24bppRgb))
  $graphics = [Drawing.Graphics]::FromImage($bitmap)
  try {
    $graphics.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.DrawImage($inputImage, 0, 0, $size, $size)
    $bitmap.Save((Join-Path $root $destination), [Drawing.Imaging.ImageFormat]::Png)
  } finally { $graphics.Dispose(); $bitmap.Dispose(); $inputImage.Dispose() }
}
$master = 'design/branding/app-icon-master.png'
$adaptive = 'design/branding/app-icon-adaptive-master.png'
Export-Icon $master 'assets/app-icon-bird-v1.png' 1024
foreach ($density in @(@('mdpi',48,108),@('hdpi',72,162),@('xhdpi',96,216),@('xxhdpi',144,324),@('xxxhdpi',192,432))) {
  $folder = 'android/app/src/main/res/mipmap-' + $density[0]
  Export-Icon $master "$folder/ic_launcher.png" $density[1]
  Export-Icon $adaptive "$folder/ic_launcher_round.png" $density[1]
  Export-Icon $adaptive "$folder/ic_launcher_foreground.png" $density[2]
}
$ios = 'ios/SevaJump/App/Assets.xcassets/AppIcon.appiconset'
$catalog = Get-Content (Join-Path $root "$ios/Contents.json") -Raw | ConvertFrom-Json
foreach ($entry in $catalog.images) {
  $size = [int]([double]($entry.size.Split('x')[0]) * [double]($entry.scale.TrimEnd('x')))
  Export-Icon $master "$ios/$($entry.filename)" $size
}
Write-Output 'Exported web, Android launcher and iOS app icons.'
