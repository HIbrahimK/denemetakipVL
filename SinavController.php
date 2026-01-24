<?php

namespace App\Http\Controllers;

use App\Models\Sinav;
use App\Models\Ogrenci;
use App\Models\LgsDepo;
use App\Models\TytDepo;
use App\Models\AytDepo;
use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\IOFactory;

class SinavController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Sinav::query();

        // Search
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('sadi', 'like', "%{$search}%")
                    ->orWhere('syayini', 'like', "%{$search}%");
            });
        }

        // Filter by Type
        if ($request->filled('type')) {
            $query->where('sturu', $request->input('type'));
        }

        // Filter by Level
        if ($request->filled('level')) {
            $query->where('seviye', $request->input('level'));
        }

        // Order by Date and add record counts
        $denemeler = $query->orderBy('starihi', 'desc')->paginate(25);

        // Add record counts for each deneme
        foreach ($denemeler as $deneme) {
            $deneme->record_count = $this->getRecordCount($deneme);
        }

        return view('denemeler.index', compact('denemeler'));
    }

    /**
     * Display exam details
     */
    public function show($id)
    {
        $sinav = Sinav::findOrFail($id);
        $recordCount = $this->getRecordCount($sinav);

        if ($recordCount == 0) {
            return redirect()->route('denemeler.index')
                ->with('error', 'Bu deneme için henüz veri yüklenmemiş.');
        }

        // Get exam results based on type
        $results = $this->getExamResults($sinav);

        // Calculate statistics
        $stats = $this->calculateStats($sinav, $results);

        // Get class-wise statistics
        $classStats = $this->getClassStats($sinav, $results);

        return view('denemeler.show', compact('sinav', 'results', 'stats', 'classStats'));
    }

    /**
     * Get exam results based on type
     */
    private function getExamResults($sinav)
    {
        switch ($sinav->sturu) {
            case 'LGS':
                return LgsDepo::where('sinav_id', $sinav->id)
                    ->with('ogrenci')
                    ->orderBy('lgs', 'desc')
                    ->get();
            case 'TYT':
                return TytDepo::where('sinav_id', $sinav->id)
                    ->with('ogrenci')
                    ->orderBy('tyt', 'desc')
                    ->get();
            case 'AYT':
                return AytDepo::where('sinav_id', $sinav->id)
                    ->with('ogrenci')
                    ->orderBy('aytsay', 'desc')
                    ->get();
            default:
                return collect();
        }
    }

    /**
     * Calculate overall statistics
     */
    private function calculateStats($sinav, $results)
    {
        if ($results->isEmpty()) {
            return [];
        }

        $stats = [
            'total_students' => $results->count(),
            'avg_score' => 0,
            'avg_net' => 0,
        ];

        switch ($sinav->sturu) {
            case 'LGS':
                $stats['avg_score'] = $results->avg('lgs');
                $stats['avg_net'] = $results->avg(function ($r) {
                    return ($r->turkced ?? 0) + ($r->matd ?? 0) + ($r->fend ?? 0) +
                        ($r->dind ?? 0) + ($r->ingd ?? 0) + ($r->sosd ?? 0) + ($r->tod ?? 0) -
                        (($r->turkcey ?? 0) + ($r->maty ?? 0) + ($r->feny ?? 0) +
                            ($r->diny ?? 0) + ($r->ingy ?? 0) + ($r->sosy ?? 0) + ($r->toy ?? 0)) * 0.25;
                });
                break;
            case 'TYT':
                $stats['avg_score'] = $results->avg('tyt');
                $stats['avg_net'] = $results->avg('topn');
                break;
            case 'AYT':
                $stats['avg_score'] = $results->avg('aytsay');
                break;
        }

        return $stats;
    }

    /**
     * Get class-wise statistics
     */
    private function getClassStats($sinav, $results)
    {
        return $results->groupBy(function ($result) {
            $sinif = $result->ogrenci->sinif ?? 'Bilinmiyor';
            $sube = $result->ogrenci->sube ?? '';
            return $sube ? "{$sinif}/{$sube}" : $sinif;
        })->map(function ($classResults) use ($sinav) {
            return $this->calculateStats($sinav, $classResults);
        })->sortKeys(); // Sort by class/section name
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('denemeler.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'sadi' => 'required|string|max:255',
            'syayini' => 'required|string|max:255',
            'starihi' => 'required|date',
            'sturu' => 'required|string|in:TYT,AYT,LGS,KDS',
            'seviye' => 'required|integer|min:5|max:12',
            'kilce' => 'nullable|integer',
            'kil' => 'nullable|integer',
            'kgenel' => 'nullable|integer',
            'answer_key' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240', // 10MB max
        ]);

        $validated['status'] = 0; // Default status: Veri Bekleniyor

        // Handle answer key upload
        if ($request->hasFile('answer_key')) {
            $file = $request->file('answer_key');
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('answer_keys', $filename, 'public');
            $validated['answer_key'] = $path;
        }

        Sinav::create($validated);

        return redirect()->route('denemeler.index')->with('success', 'Deneme başarıyla oluşturuldu.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Sinav $denemeler)
    {
        $validated = $request->validate([
            'sadi' => 'required|string|max:255',
            'syayini' => 'required|string|max:255',
            'starihi' => 'required|date',
            'sturu' => 'required|string|in:TYT,AYT,LGS,KDS',
            'seviye' => 'required|integer|min:5|max:12',
            'kilce' => 'nullable|integer',
            'kil' => 'nullable|integer',
            'kgenel' => 'nullable|integer',
            'answer_key' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240', // 10MB max
        ]);

        // Handle answer key upload
        if ($request->hasFile('answer_key')) {
            // Delete old answer key if exists
            if ($denemeler->answer_key && \Storage::disk('public')->exists($denemeler->answer_key)) {
                \Storage::disk('public')->delete($denemeler->answer_key);
            }

            $file = $request->file('answer_key');
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('answer_keys', $filename, 'public');
            $validated['answer_key'] = $path;
        }

        $denemeler->update($validated);

        return redirect()->route('denemeler.index')->with('success', 'Deneme başarıyla güncellendi.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $sinav = Sinav::findOrFail($id);

        // Delete answer key file if exists
        if ($sinav->answer_key && \Storage::disk('public')->exists($sinav->answer_key)) {
            \Storage::disk('public')->delete($sinav->answer_key);
        }

        $sinav->delete();

        return redirect()->route('denemeler.index')->with('success', 'Deneme başarıyla silindi.');
    }

    /**
     * Download answer key file
     */
    public function downloadAnswerKey($id)
    {
        $sinav = Sinav::findOrFail($id);

        if (!$sinav->hasAnswerKey()) {
            return redirect()->back()->with('error', 'Cevap anahtarı bulunamadı.');
        }

        $filePath = storage_path('app/public/' . $sinav->answer_key);
        $originalName = 'cevap_anahtari_' . $sinav->sadi . '.' . $sinav->getAnswerKeyExtension();

        return response()->download($filePath, $originalName);
    }

    /**
     * Delete answer key file
     */
    public function deleteAnswerKey($id)
    {
        $sinav = Sinav::findOrFail($id);

        if ($sinav->answer_key && \Storage::disk('public')->exists($sinav->answer_key)) {
            \Storage::disk('public')->delete($sinav->answer_key);
            $sinav->update(['answer_key' => null]);
            return redirect()->back()->with('success', 'Cevap anahtarı başarıyla silindi.');
        }

        return redirect()->back()->with('error', 'Cevap anahtarı bulunamadı.');
    }

    /**
     * Import exam data from Excel
     */
    /**
     * Import exam data from Excel - Step 1: Parse and show review
     */
    public function importData(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv',
            'sinav_id' => 'required|exists:sinav,id'
        ]);

        $sinav = Sinav::findOrFail($request->sinav_id);
        $file = $request->file('file');

        try {
            $fileToProcess = $file->getPathname();

            // AUTO-DETECT AND CONVERT 71-COLUMN FORMAT FOR AYT
            if ($sinav->sturu === 'AYT') {
                $converter = new \App\Services\AYTFormatConverter();

                if ($converter->is71ColumnFormat($fileToProcess)) {
                    // Create temp directory if it doesn't exist
                    $tempDir = storage_path('app/temp');
                    if (!file_exists($tempDir)) {
                        mkdir($tempDir, 0755, true);
                    }

                    // Convert to template format
                    $convertedPath = $tempDir . '/converted_' . time() . '_' . uniqid() . '.xlsx';

                    if ($converter->convertToTemplate($fileToProcess, $convertedPath)) {
                        $fileToProcess = $convertedPath;
                        session()->flash('info', '71 sütunlu alternatif format algılandı ve otomatik olarak şablon formatına dönüştürüldü.');
                    } else {
                        return redirect()->route('denemeler.index')
                            ->with('error', 'Format dönüştürme hatası oluştu. Lütfen dosyayı kontrol edin.');
                    }
                }
            }

            // AUTO-DETECT AND CONVERT 54-COLUMN FORMAT FOR TYT
            if ($sinav->sturu === 'TYT') {
                $converter = new \App\Services\TYTFormatConverter();

                if ($converter->isCustomFormat($fileToProcess)) {
                    // Create temp directory if it doesn't exist
                    $tempDir = storage_path('app/temp');
                    if (!file_exists($tempDir)) {
                        mkdir($tempDir, 0755, true);
                    }

                    // Convert to template format
                    $convertedPath = $tempDir . '/converted_' . time() . '_' . uniqid() . '.xlsx';

                    if ($converter->convertToTemplate($fileToProcess, $convertedPath)) {
                        $fileToProcess = $convertedPath;
                        session()->flash('info', '54 sütunlu alternatif format algılandı ve otomatik olarak şablon formatına dönüştürüldü.');
                    } else {
                        return redirect()->route('denemeler.index')
                            ->with('error', 'Format dönüştürme hatası oluştu. Lütfen dosyayı kontrol edin.');
                    }
                }
            }


            $spreadsheet = IOFactory::load($fileToProcess);
            $worksheet = $spreadsheet->getActiveSheet();

            // Get all student okul_no from database  
            $allStudents = Ogrenci::pluck('id', 'okul_no')->toArray();
            $normalizedStudents = [];
            foreach ($allStudents as $okul_no => $id) {
                $normalizedStudents[trim((string) $okul_no)] = [
                    'id' => $id,
                    'name' => Ogrenci::find($id)->full_name ?? ''
                ];
            }

            $highestRow = $worksheet->getHighestRow();
            $importData = [];

            // Start from row 2 (skip header)
            for ($rowIndex = 2; $rowIndex <= $highestRow; $rowIndex++) {
                $row = $worksheet->getRowIterator($rowIndex, $rowIndex)->current();
                $cellIterator = $row->getCellIterator();
                $cellIterator->setIterateOnlyExistingCells(false);

                $rowData = [];
                foreach ($cellIterator as $cell) {
                    $rowData[] = $cell->getValue();
                }

                $okulNo = trim((string) ($rowData[0] ?? ''));

                // Skip completely empty rows
                if (empty(array_filter($rowData))) {
                    continue;
                }

                $isValid = true;
                $errorMessage = '';

                if (empty($okulNo) || $okulNo == '0' || $okulNo == '000' || $okulNo == '***') {
                    $isValid = false;
                    $errorMessage = 'Geçersiz Okul No';
                } elseif (!isset($normalizedStudents[$okulNo])) {
                    $isValid = false;
                    $errorMessage = 'Öğrenci Kayıtlı Değil';
                }

                $importData[] = [
                    'okul_no' => $okulNo,
                    'name' => $rowData[1] ?? ($normalizedStudents[$okulNo]['name'] ?? 'Bilinmiyor'),
                    'class' => $rowData[2] ?? '',
                    'data' => array_slice($rowData, 3),
                    'is_valid' => $isValid,
                    'error' => $errorMessage,
                    'ogrenci_id' => $normalizedStudents[$okulNo]['id'] ?? null
                ];
            }

            // Store in session
            session(['temp_import_data' => $importData]);
            session(['temp_import_sinav_id' => $sinav->id]);

            return redirect()->route('denemeler.import_review');

        } catch (\Exception $e) {
            return redirect()->route('denemeler.index')
                ->with('error', 'Dosya yüklenirken hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Show import review page
     */
    public function showImportReview()
    {
        $importData = session('temp_import_data');
        $sinavId = session('temp_import_sinav_id');

        if (!$importData || !$sinavId) {
            return redirect()->route('denemeler.index')->with('error', 'Geçerli bir içe aktarma verisi bulunamadı.');
        }

        $sinav = Sinav::findOrFail($sinavId);

        return view('denemeler.import_review', compact('importData', 'sinav'));
    }

    /**
     * Finalize the import after review
     */
    public function confirmImport(Request $request)
    {
        $request->validate([
            'sinav_id' => 'required|exists:sinav,id',
            'rows' => 'required|array'
        ]);

        $sinav = Sinav::findOrFail($request->sinav_id);

        // DEBUG: Log how many rows are received vs expected
        $receivedRowCount = count($request->rows ?? []);
        \Log::info("Import Confirmation - Sinav ID: {$sinav->id}, Rows received in POST: {$receivedRowCount}");

        // Check for potential max_input_vars issue
        $sessionRowCount = count(session('temp_import_data', []));
        if ($sessionRowCount > 0 && $receivedRowCount < $sessionRowCount) {
            $missingRows = $sessionRowCount - $receivedRowCount;
            \Log::warning("max_input_vars limit exceeded - Expected: {$sessionRowCount}, Received: {$receivedRowCount}, Missing: {$missingRows}");

            return redirect()->route('denemeler.index')
                ->with('error', "UYARI: PHP max_input_vars limiti aşıldı! İnceleme sayfasında {$sessionRowCount} satır vardı ancak sadece {$receivedRowCount} satır sunucuya ulaştı. {$missingRows} satır kayboldu.<br><br>" .
                    "<strong>Çözüm:</strong> Lütfen sistem yöneticinizden php.ini dosyasında 'max_input_vars' değerini en az " . ($sessionRowCount * 100) . " olarak ayarlamasını isteyin.<br>" .
                    "<strong>Geçici Çözüm:</strong> Daha az öğrenci ile (maksimum 10-15 öğrenci) küçük gruplar halinde import yapın.");
        }

        $insertedCount = 0;
        $skippedCount = 0;
        $skipReasons = [];

        // Get fresh students list
        $allStudents = Ogrenci::pluck('id', 'okul_no')->toArray();
        $normalizedStudents = [];
        foreach ($allStudents as $okul_no => $id) {
            $normalizedStudents[trim((string) $okul_no)] = $id;
        }

        foreach ($request->rows as $index => $row) {
            $okulNo = $row['okul_no'] ?? '';

            // Check for empty or invalid okul_no
            if (empty($okulNo) || $okulNo == '0' || $okulNo == '000' || $okulNo == '***') {
                $skippedCount++;
                $key = 'Geçersiz/Boş Okul No';
                $skipReasons[$key] = ($skipReasons[$key] ?? 0) + 1;
                continue;
            }

            // Check if student exists in database
            if (!isset($normalizedStudents[$okulNo])) {
                $skippedCount++;
                $key = "Öğrenci Kayıtlı Değil (No: $okulNo)";
                $skipReasons[$key] = ($skipReasons[$key] ?? 0) + 1;
                continue;
            }

            $ogrenciId = $normalizedStudents[$okulNo];

            // Check for duplicate entry
            if ($this->recordExists($sinav, $ogrenciId)) {
                $skippedCount++;
                $student = Ogrenci::find($ogrenciId);
                $key = "Öğrenci Zaten Bu Denemede Kayıtlı (No: $okulNo - " . ($student->full_name ?? 'Ad Bilinmiyor') . ")";
                $skipReasons[$key] = ($skipReasons[$key] ?? 0) + 1;
                continue;
            }

            // Construct rowData compatible with importRow
            $rowData = array_merge([$okulNo, $row['name'], $row['class']], $row['data']);

            $imported = $this->importRow($sinav, $ogrenciId, $okulNo, $rowData);
            if ($imported) {
                $insertedCount++;
            } else {
                $skippedCount++;
                $key = "Veri İşleme Hatası (No: $okulNo)";
                $skipReasons[$key] = ($skipReasons[$key] ?? 0) + 1;
            }
        }

        if ($insertedCount > 0) {
            $sinav->update(['status' => 1]);
        }

        // Clean up session
        session()->forget(['temp_import_data', 'temp_import_sinav_id']);

        // Build detailed message
        $message = "Başarıyla {$insertedCount} kayıt eklendi.";

        if ($skippedCount > 0) {
            $message .= " {$skippedCount} kayıt atlandı.";

            if (!empty($skipReasons)) {
                $message .= "<br><br><strong>Atlanan Kayıtların Detayları:</strong><ul class='list-disc ml-6 mt-2'>";
                foreach ($skipReasons as $reason => $count) {
                    $message .= "<li>{$reason}: <strong>{$count} adet</strong></li>";
                }
                $message .= "</ul>";
            }
        }

        // Trigger Rank Recalculation
        try {
            $rankService = new \App\Services\RankService();
            $rankService->recalculateRanks($sinav);
        } catch (\Exception $e) {
            \Log::error("Rank Recalculation Error: " . $e->getMessage());
            // Don't block the valid response, just log it
        }

        return redirect()->route('denemeler.index')
            ->with('success', $message);
    }

    // ... (quickAddStudents and refreshSessionData methods unchanged) ...

    /**
     * Delete all exam data
     */
    public function deleteData($id)
    {
        $sinav = Sinav::findOrFail($id);

        try {
            $deletedCount = 0;

            switch ($sinav->sturu) {
                case 'LGS':
                    $deletedCount = LgsDepo::where('sinav_id', $sinav->id)->delete();
                    break;
                case 'TYT':
                    $deletedCount = TytDepo::where('sinav_id', $sinav->id)->delete();
                    break;
                case 'AYT':
                    $deletedCount = AytDepo::where('sinav_id', $sinav->id)->delete();
                    break;
            }

            // Update status
            $sinav->update(['status' => 0]);

            // We deleted everything, so no need to recalculate ranks for THIS exam (it's empty).
            // But if we supported partial delete, we would need it.
            // Since it is "Delete All Data", no recalculation needed.

            return redirect()->route('denemeler.index')
                ->with('success', "{$deletedCount} kayıt silindi.");

        } catch (\Exception $e) {
            return redirect()->route('denemeler.index')
                ->with('error', 'Veri silinirken hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Get record count for an exam
     */
    private function getRecordCount($sinav)
    {
        switch ($sinav->sturu) {
            case 'LGS':
                return LgsDepo::where('sinav_id', $sinav->id)->count();
            case 'TYT':
                return TytDepo::where('sinav_id', $sinav->id)->count();
            case 'AYT':
                return AytDepo::where('sinav_id', $sinav->id)->count();
            default:
                return 0;
        }
    }

    /**
     * Check if record exists for this student and exam
     */
    private function recordExists($sinav, $ogrenciId)
    {
        switch ($sinav->sturu) {
            case 'LGS':
                return LgsDepo::where('sinav_id', $sinav->id)
                    ->where('ogrenci_id', $ogrenciId)->exists();
            case 'TYT':
                return TytDepo::where('sinav_id', $sinav->id)
                    ->where('ogrenci_id', $ogrenciId)->exists();
            case 'AYT':
                return AytDepo::where('sinav_id', $sinav->id)
                    ->where('ogrenci_id', $ogrenciId)->exists();
            default:
                return false;
        }
    }

    /**
     * Import a single row based on exam type
     */
    private function importRow($sinav, $ogrenciId, $okulNo, $rowData)
    {
        try {
            switch ($sinav->sturu) {
                case 'LGS':
                    return $this->importLgsRow($sinav->id, $ogrenciId, $okulNo, $rowData);
                case 'TYT':
                    return $this->importTytRow($sinav->id, $ogrenciId, $okulNo, $rowData);
                case 'AYT':
                    return $this->importAytRow($sinav->id, $ogrenciId, $okulNo, $rowData);
                default:
                    return false;
            }
        } catch (\Exception $e) {
            \Log::error("Import error for okul_no {$okulNo}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Import LGS row
     * Excel columns: 1=okul_no, 2=name(skip), 3=class(skip), 4+=data
     */
    private function importLgsRow($sinavId, $ogrenciId, $okulNo, $data)
    {
        LgsDepo::create([
            'sinav_id' => $sinavId,
            'ogrenci_id' => $ogrenciId,
            'numarasi' => $okulNo,
            'turkced' => $data[3] ?? null,  // Column 4
            'turkcey' => $data[4] ?? null,
            'turkcen' => $data[5] ?? null,
            'sosd' => $data[6] ?? null,
            'sosy' => $data[7] ?? null,
            'sosn' => $data[8] ?? null,
            'dind' => $data[9] ?? null,
            'diny' => $data[10] ?? null,
            'dinn' => $data[11] ?? null,
            'ingd' => $data[12] ?? null,
            'ingy' => $data[13] ?? null,
            'ingn' => $data[14] ?? null,
            'matd' => $data[15] ?? null,
            'maty' => $data[16] ?? null,
            'matn' => $data[17] ?? null,
            'fend' => $data[18] ?? null,
            'feny' => $data[19] ?? null,
            'fenn' => $data[20] ?? null,
            'tod' => $data[21] ?? null,
            'toy' => $data[22] ?? null,
            'ton' => $data[23] ?? null,
            'lgs' => $data[24] ?? null,
            'dereces' => $data[25] ?? null,
            'dereceo' => $data[26] ?? null,
            'dereceilce' => $data[27] ?? null,
            'dereceil' => $data[28] ?? null,
            'dereceg' => $data[29] ?? null,
            'sinifseviye' => $data[30] ?? null,
        ]);
        return true;
    }

    /**
     * Import TYT row
     */
    private function importTytRow($sinavId, $ogrenciId, $okulNo, $data)
    {
        TytDepo::create([
            'sinav_id' => $sinavId,
            'ogrenci_id' => $ogrenciId,
            'numarasi' => $okulNo,
            // Türkçe (columns 4-6, indices 3-5)
            'turkced' => $data[3] ?? null,
            'turkcey' => $data[4] ?? null,
            'turkcen' => $data[5] ?? null,
            // Tarih (columns 7-9, indices 6-8)
            'tarihd' => $data[6] ?? null,
            'tarihy' => $data[7] ?? null,
            'tarihn' => $data[8] ?? null,
            // Coğrafya (columns 10-12, indices 9-11)
            'cografyad' => $data[9] ?? null,
            'cografyay' => $data[10] ?? null,
            'cografyan' => $data[11] ?? null,
            // Felsefe (columns 13-15, indices 12-14)
            'felsefed' => $data[12] ?? null,
            'felsefey' => $data[13] ?? null,
            'felsefen' => $data[14] ?? null,
            // Din (columns 16-18, indices 15-17)
            'dind' => $data[15] ?? null,
            'diny' => $data[16] ?? null,
            'dinn' => $data[17] ?? null,
            // Matematik (columns 19-21, indices 18-20)
            'matd' => $data[18] ?? null,
            'maty' => $data[19] ?? null,
            'matn' => $data[20] ?? null,
            // Fizik (columns 22-24, indices 21-23)
            'fizikd' => $data[21] ?? null,
            'fiziky' => $data[22] ?? null,
            'fizikn' => $data[23] ?? null,
            // Kimya (columns 25-27, indices 24-26)
            'kimyad' => $data[24] ?? null,
            'kimyay' => $data[25] ?? null,
            'kimyan' => $data[26] ?? null,
            // Biyoloji (columns 28-30, indices 27-29)
            'biyod' => $data[27] ?? null,
            'biyoy' => $data[28] ?? null,
            'biyon' => $data[29] ?? null,
            // Toplam (columns 31-33, indices 30-32)
            'topd' => $data[30] ?? null,
            'topy' => $data[31] ?? null,
            'topn' => $data[32] ?? null,
            // TYT Puanı (column 34, index 33)
            'tyt' => $data[33] ?? null,
            // Dereceler (columns 35-39, indices 34-38)
            'dereces' => $data[34] ?? null,
            'dereceo' => $data[35] ?? null,
            'dereceilce' => $data[36] ?? null,
            'dereceil' => $data[37] ?? null,
            'dereceg' => $data[38] ?? null,
        ]);
        return true;
    }

    /**
     * Import AYT row
     * Excel columns: 1=okul_no, 2=name(skip), 3=class(skip), 4+=data
     */
    private function importAytRow($sinavId, $ogrenciId, $okulNo, $data)
    {
        AytDepo::create([
            'sinav_id' => $sinavId,
            'ogrenci_id' => $ogrenciId,
            'numarasi' => $okulNo,
            // Edebiyat (columns 4-6: N-D-Y format)
            'edebn' => $data[3] ?? null,
            'edebd' => $data[4] ?? null,
            'edeby' => $data[5] ?? null,
            // Tarih-1 (columns 7-9: N-D-Y format)
            'tarih1n' => $data[6] ?? null,
            'tarih1d' => $data[7] ?? null,
            'tarih1y' => $data[8] ?? null,
            // Coğrafya-1 (columns 10-12: N-D-Y format)
            'cografya1n' => $data[9] ?? null,
            'cografya1d' => $data[10] ?? null,
            'cografya1y' => $data[11] ?? null,
            // Tarih-2 (columns 13-15: N-D-Y format)
            'tarih2n' => $data[12] ?? null,
            'tarih2d' => $data[13] ?? null,
            'tarih2y' => $data[14] ?? null,
            // Coğrafya-2 (columns 16-18: N-D-Y format)
            'cografya2n' => $data[15] ?? null,
            'cografya2d' => $data[16] ?? null,
            'cografya2y' => $data[17] ?? null,
            // Felsefe (columns 19-21: N-D-Y format)
            'felsefen' => $data[18] ?? null,
            'felsefed' => $data[19] ?? null,
            'felsefey' => $data[20] ?? null,
            // Din (columns 22-24: N-D-Y format)
            'dinn' => $data[21] ?? null,
            'dind' => $data[22] ?? null,
            'diny' => $data[23] ?? null,
            // Matematik (columns 25-27: N-D-Y format)
            'matn' => $data[24] ?? null,
            'matd' => $data[25] ?? null,
            'maty' => $data[26] ?? null,
            // Fizik (columns 28-30: N-D-Y format)
            'fizikn' => $data[27] ?? null,
            'fizikd' => $data[28] ?? null,
            'fiziky' => $data[29] ?? null,
            // Kimya (columns 31-33: N-D-Y format)
            'kimyan' => $data[30] ?? null,
            'kimyad' => $data[31] ?? null,
            'kimyay' => $data[32] ?? null,
            // Biyoloji (columns 34-36: N-D-Y format)
            'biyon' => $data[33] ?? null,
            'biyod' => $data[34] ?? null,
            'biyoy' => $data[35] ?? null,
            // Toplam (columns 37-39: N-D-Y format)
            'topn' => $data[36] ?? null,
            'topd' => $data[37] ?? null,
            'topy' => $data[38] ?? null,
            // AYT SAY Score (column 40)
            'aytsay' => $data[39] ?? null,
            // SAY Rankings (columns 41-45)
            'saysinif' => $data[40] ?? null,
            'sayokul' => $data[41] ?? null,
            'sayilce' => $data[42] ?? null,
            'sayil' => $data[43] ?? null,
            'saygenel' => $data[44] ?? null,
            // AYT EA Score (column 46)
            'aytea' => $data[45] ?? null,
            // EA Rankings (columns 47-51)
            'easinif' => $data[46] ?? null,
            'eaokul' => $data[47] ?? null,
            'eailce' => $data[48] ?? null,
            'eail' => $data[49] ?? null,
            'eagenel' => $data[50] ?? null,
            // AYT SÖZ Score (column 52)
            'aytsoz' => $data[51] ?? null,
            // SÖZ Rankings (columns 53-57)
            'sozsinif' => $data[52] ?? null,
            'sozokul' => $data[53] ?? null,
            'sozilce' => $data[54] ?? null,
            'sozil' => $data[55] ?? null,
            'sozgenel' => $data[56] ?? null,
        ]);
        return true;
    }

    /**
     * Download exam template
     */
    public function downloadTemplate($type)
    {
        $templates = [
            'lgs' => 'lgsSablon.xls',
            'tyt' => 'TYTSablon.xlsx',
            'ayt' => 'AYTSablon.xlsx',
        ];

        if (!isset($templates[$type])) {
            abort(404);
        }

        $fileName = $templates[$type];
        $filePath = public_path('templates/' . $fileName);

        if (!file_exists($filePath)) {
            abort(404);
        }

        $headers = [];

        if (str_ends_with($fileName, '.xls')) {
            $headers['Content-Type'] = 'application/vnd.ms-excel';
        } else {
            $headers['Content-Type'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        }

        return response()->download($filePath, $fileName, $headers);
    }
}

