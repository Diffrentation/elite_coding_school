
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile('C:/Users/hp/.gemini/antigravity/brain/116796a0-8f9b-4c6a-885a-df6d59803cf6/.user_uploaded/media_1794568962838_ad79dfd5.jpg')
$img.Save('C:/Users/hp/Documents/elite_coding_school/scratch/sig3_orig.png', [System.Drawing.Imaging.ImageFormat]::Png)
$img.Dispose()
Write-Output "Saved PNG"
