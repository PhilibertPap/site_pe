param(
    [string]$RootDir = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem

$annalesDir = Join-Path $RootDir 'imports/drive/annales'
$dataOut = Join-Path $RootDir 'src/data/annales.manifest.json'
$raw2022Out = Join-Path $RootDir 'imports/drive/annales/annales.qcm.2022.raw.json'
$asset2022Dir = Join-Path $RootDir 'src/assets/annales/qcm/2022'

if (-not (Test-Path $annalesDir)) {
    throw "Dossier introuvable: $annalesDir"
}

function Normalize-Path([string]$path) {
    return $path.Replace('\', '/')
}

function Read-ZipEntryText([string]$zipPath, [string]$entryName) {
    $zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
    try {
        $entry = $zip.Entries | Where-Object { $_.FullName -eq $entryName } | Select-Object -First 1
        if (-not $entry) { return $null }
        $reader = [System.IO.StreamReader]::new($entry.Open())
        try {
            return $reader.ReadToEnd()
        } finally {
            $reader.Dispose()
        }
    } finally {
        $zip.Dispose()
    }
}

function Get-SessionLabel([string]$fileName) {
    $lower = $fileName.ToLowerInvariant()
    if ($lower -match 'mars') { return 'mars' }
    if ($lower -match 'octobre') { return 'octobre' }
    return 'annuel'
}

function Get-YearFromPath([string]$relPath) {
    $match = [regex]::Match($relPath, '/(20\d{2})/')
    if ($match.Success) { return [int]$match.Groups[1].Value }
    return $null
}

function Get-Domain([string]$relPath) {
    if ($relPath -like 'Annales QCM/*') { return 'qcm' }
    if ($relPath -like 'Annales cartographie/*') { return 'cartographie' }
    if ($relPath -like 'Annales marée/*') { return 'maree' }
    return 'autre'
}

function Get-FileRole([string]$fileName) {
    $lower = $fileName.ToLowerInvariant()
    if ($lower -match 'corrig') { return 'corrige' }
    if ($lower -match 'sujet') { return 'sujet' }
    return 'autre'
}

function Parse-QcmAnswerKeyFromDocx([string]$docxPath) {
    $xml = Read-ZipEntryText -zipPath $docxPath -entryName 'word/document.xml'
    if (-not $xml) { return $null }

    $plain = [regex]::Replace($xml, '<[^>]+>', ' ')
    $plain = [regex]::Replace($plain, '\s+', ' ').Trim()

    $map = @{}
    $matches = [regex]::Matches($plain, '(?<!\d)([1-9]|[12]\d|30)\s*[\.\):-]\s*([A-E])\b')
    foreach ($m in $matches) {
        $q = [int]$m.Groups[1].Value
        $answer = $m.Groups[2].Value
        if (-not $map.ContainsKey($q)) {
            $map[$q] = $answer
        }
    }

    if ($map.Count -ge 25) {
        $out = @()
        foreach ($i in 1..30) {
            if ($map.ContainsKey($i)) { $out += $map[$i] }
            else { $out += $null }
        }
        return $out
    }

    $fallback = [regex]::Matches($plain, '\b[A-E]\b') | ForEach-Object { $_.Value }
    if ($fallback.Count -eq 30) {
        return @($fallback)
    }

    return $null
}

function Copy-ZipEntryToFile([System.IO.Compression.ZipArchive]$zip, [string]$entryName, [string]$destPath) {
    $entry = $zip.Entries | Where-Object { $_.FullName -eq $entryName } | Select-Object -First 1
    if (-not $entry) { return $false }
    $destDir = Split-Path -Parent $destPath
    if (-not (Test-Path $destDir)) {
        New-Item -ItemType Directory -Force -Path $destDir | Out-Null
    }
    $inStream = $entry.Open()
    try {
        $outStream = [System.IO.File]::Create($destPath)
        try {
            $inStream.CopyTo($outStream)
        } finally {
            $outStream.Dispose()
        }
    } finally {
        $inStream.Dispose()
    }
    return $true
}

function Parse-QcmPpsx2022([string]$ppsxPath, [string]$assetDir) {
    $zip = [System.IO.Compression.ZipFile]::OpenRead($ppsxPath)
    try {
        $slideEntries = $zip.Entries |
            Where-Object { $_.FullName -like 'ppt/slides/slide*.xml' } |
            Sort-Object {
                [int]([regex]::Match($_.FullName, 'slide(\d+)\.xml').Groups[1].Value)
            }

        if (-not (Test-Path $assetDir)) {
            New-Item -ItemType Directory -Force -Path $assetDir | Out-Null
        }

        $allMedia = [System.Collections.Generic.HashSet[string]]::new()
        $slides = @()

        foreach ($slide in $slideEntries) {
            $slideNumber = [int]([regex]::Match($slide.FullName, 'slide(\d+)\.xml').Groups[1].Value)
            $reader = [System.IO.StreamReader]::new($slide.Open())
            try {
                $xml = $reader.ReadToEnd()
            } finally {
                $reader.Dispose()
            }

            $tokens = [regex]::Matches($xml, '<a:t>(.*?)</a:t>') | ForEach-Object {
                [regex]::Replace($_.Groups[1].Value, '\s+', ' ').Trim()
            } | Where-Object { $_ -ne '' }

            $joined = ($tokens -join ' | ')
            $questionMatch = [regex]::Match($joined, 'Question\s*(\d+)')
            $questionNumber = $null
            if ($questionMatch.Success) {
                $questionNumber = [int]$questionMatch.Groups[1].Value
            }

            $relsPath = "ppt/slides/_rels/slide$slideNumber.xml.rels"
            $relsEntry = $zip.Entries | Where-Object { $_.FullName -eq $relsPath } | Select-Object -First 1
            $media = @()
            if ($relsEntry) {
                $r = [System.IO.StreamReader]::new($relsEntry.Open())
                try {
                    $relsXml = $r.ReadToEnd()
                } finally {
                    $r.Dispose()
                }
                $media = [regex]::Matches($relsXml, 'Target="\.\./media/([^"]+)"') | ForEach-Object { $_.Groups[1].Value }
            }

            foreach ($mediaName in $media) {
                $allMedia.Add($mediaName) | Out-Null
            }

            $mediaAssets = @($media | ForEach-Object { "assets/annales/qcm/2022/$_" })
            $slides += [ordered]@{
                slide = $slideNumber
                question = $questionNumber
                mediaCount = $media.Count
                mediaAssets = $mediaAssets
                text = $joined
                tokens = $tokens
            }
        }

        foreach ($mediaName in $allMedia) {
            $sourceEntry = "ppt/media/$mediaName"
            $dest = Join-Path $assetDir $mediaName
            [void](Copy-ZipEntryToFile -zip $zip -entryName $sourceEntry -destPath $dest)
        }

        $questions = $slides | Where-Object { $_.question -ne $null } | Sort-Object { [int]$_.question }
        return [ordered]@{
            source = Normalize-Path((Resolve-Path $ppsxPath).Path.Substring($RootDir.Length + 1))
            slidesCount = $slides.Count
            questionCount = $questions.Count
            questionSlidesWithMedia = ($questions | Where-Object { $_.mediaCount -gt 0 }).Count
            extractedMediaCount = $allMedia.Count
            questions = $questions
        }
    } finally {
        $zip.Dispose()
    }
}

$files = Get-ChildItem -Path $annalesDir -Recurse -File |
    Where-Object { $_.FullName -notlike '*\.ppsx_extract\*' } |
    Sort-Object FullName

$seriesByKey = @{}
foreach ($file in $files) {
    $rel = Normalize-Path($file.FullName.Substring($annalesDir.Length + 1))
    $domain = Get-Domain $rel
    if ($domain -eq 'autre') { continue }

    $year = Get-YearFromPath("/$rel")
    $session = Get-SessionLabel($file.Name)
    $role = Get-FileRole($file.Name)
    $ext = $file.Extension.TrimStart('.').ToLowerInvariant()

    $key = "$domain|$year|$session"
    if (-not $seriesByKey.ContainsKey($key)) {
        $seriesByKey[$key] = [ordered]@{
            domain = $domain
            year = $year
            session = $session
            sujets = @()
            corriges = @()
            metadata = [ordered]@{
                hasDocxAnswerKey = $false
                answerKey = $null
            }
        }
    }

    $item = [ordered]@{
        path = "imports/drive/annales/$rel"
        name = $file.Name
        extension = $ext
        size = $file.Length
    }

    if ($role -eq 'sujet') {
        $seriesByKey[$key].sujets += $item
    } elseif ($role -eq 'corrige') {
        $seriesByKey[$key].corriges += $item
        if ($domain -eq 'qcm' -and $ext -eq 'docx') {
            $answerKey = Parse-QcmAnswerKeyFromDocx -docxPath $file.FullName
            if ($null -ne $answerKey) {
                $seriesByKey[$key].metadata.hasDocxAnswerKey = $true
                $seriesByKey[$key].metadata.answerKey = $answerKey
            }
        }
    } else {
        # Classer les fichiers non détectés comme sujets pour ne rien perdre
        $seriesByKey[$key].sujets += $item
    }
}

$series = @($seriesByKey.Values | Sort-Object domain, year, session)
$qcm2022Path = Join-Path $annalesDir 'Annales QCM/2022/PE-2022-QCM-Sujet.ppsx'
$qcm2022 = $null
if (Test-Path $qcm2022Path) {
    $qcm2022 = Parse-QcmPpsx2022 -ppsxPath $qcm2022Path -assetDir $asset2022Dir
}

$manifest = [ordered]@{
    generatedAt = (Get-Date).ToString('o')
    sourceDir = 'imports/drive/annales'
    totals = [ordered]@{
        files = $files.Count
        series = $series.Count
        qcmSeries = (@($series | Where-Object { $_.domain -eq 'qcm' })).Count
        cartographieSeries = (@($series | Where-Object { $_.domain -eq 'cartographie' })).Count
        mareeSeries = (@($series | Where-Object { $_.domain -eq 'maree' })).Count
    }
    series = $series
    extracted = [ordered]@{
        qcm2022 = $qcm2022
    }
}

$manifestJson = $manifest | ConvertTo-Json -Depth 12
Set-Content -Path $dataOut -Value $manifestJson -Encoding UTF8

if ($qcm2022) {
    $rawJson = $qcm2022 | ConvertTo-Json -Depth 12
    Set-Content -Path $raw2022Out -Value $rawJson -Encoding UTF8
}

Write-Output "Manifest genere: $dataOut"
if ($qcm2022) {
    Write-Output "Extraction 2022 QCM: $raw2022Out"
    Write-Output "Visuels extraits: $asset2022Dir"
}
