import React, { useState } from 'react';
import { NeighborhoodData } from '../types';
import { 
  X, 
  Upload, 
  FileText, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Download, 
  Database,
  RefreshCw
} from 'lucide-react';

interface DataUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyDataset: (updatedNeighborhoods: NeighborhoodData[]) => void;
  currentNeighborhoods: NeighborhoodData[];
}

export const DataUploaderModal: React.FC<DataUploaderModalProps> = ({
  isOpen,
  onClose,
  onApplyDataset,
  currentNeighborhoods,
}) => {
  const [pasteData, setPasteData] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Sample presets for users to test immediately
  const loadPreset = (presetType: 'security2025' | 'ego2025' | 'student' | 'new_neighborhoods') => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (presetType === 'security2025') {
      const csv = `mahalle,ilce,guvenlik_skoru,suc_kategori,yasanabilirlik,ortalama_kira
Kavaklıdere & Tunalı Hilmi,Çankaya,95,Çok Düşük,98,42000
Bahçelievler & Emek,Çankaya,92,Çok Düşük,95,34000
Çayyolu & Ümitköy,Çankaya,97,Çok Düşük,96,46000
Batıkent (Kentkoop & İlkyerleşim),Yenimahalle,90,Düşük,92,26000
Eryaman (Göksu & Tunahan),Etimesgut,93,Çok Düşük,94,29000
Ulus & Kale / Hacıbayram,Altındağ,62,Yüksek,68,18500
Karapürçek & Hüseyingazi,Altındağ,58,Yüksek,60,15000`;
      setPasteData(csv);
      setFileName('ankara_2025_emniyet_asayis_raporu.csv');
      parseCSVText(csv);
    } else if (presetType === 'ego2025') {
      const json = JSON.stringify([
        {
          "name": "Kızılay & Sıhhiye",
          "district": "Çankaya",
          "transportScore": 100,
          "livabilityScore": 86,
          "dailyTransitUsage": "Günde 820.000 yolcu aktarması (M1-M4 & Ankaray)",
          "averageRent": 28000
        },
        {
          "name": "Batıkent (Kentkoop & İlkyerleşim)",
          "district": "Yenimahalle",
          "transportScore": 96,
          "livabilityScore": 92,
          "metroLines": ["M1", "M3", "Yeni Ekspres"],
          "averageRent": 25000
        },
        {
          "name": "Eryaman (Göksu & Tunahan)",
          "district": "Etimesgut",
          "transportScore": 95,
          "livabilityScore": 94,
          "metroLines": ["M3"],
          "averageRent": 28500
        }
      ], null, 2);
      setPasteData(json);
      setFileName('ego_2025_toplu_tasima_guncelleme.json');
      parseJSONText(json);
    } else if (presetType === 'new_neighborhoods') {
      const csv = `mahalle,ilce,lat,lng,guvenlik_skoru,suc_kategori,yasanabilirlik,egitim_skoru,ulasim_skoru,eglence_skoru,ortalama_kira,vibe
Yaşamkent & Türkkonut,Çankaya,39.8660,32.6640,95,Çok Düşük,96,93,88,87,44000,Geniş peyzajlı siteler ve çocuklu aileler için huzurlu kentsel vaha
Beysukent & Angora Evleri,Çankaya,39.8820,32.7310,97,Çok Düşük,97,96,89,90,52000,Elit villa konsepti, yemyeşil doğa ve üst düzey asayiş güvencesi
Ovacık & Forum Ankara,Keçiören,40.0050,32.8250,80,Düşük,82,76,84,86,26000,Modern kentsel dönüşüm, geniş parklar ve alışveriş aksı`;
      setPasteData(csv);
      setFileName('yeni_mahalle_ekleme_listesi.csv');
      parseCSVText(csv);
    } else {
      const csv = `mahalle,ilce,egitim_skoru,eglence_skoru,yasanabilirlik,vibe
Bahçelievler & Emek,Çankaya,98,96,96,Öğrenci dostu kafeler, 7. Cadde enerjisi ve sınav geceleri
Beytepe & İncek / Bilkent,Çankaya,99,92,95,Bilkent ve Hacettepe kampüs doğası ve elit kütüphaneler
Kızılay & Sıhhiye,Çankaya,94,97,87,Ulaşım sıfır noktası ve yüzlerce kütüphane/dershane
Kavaklıdere & Tunalı Hilmi,Çankaya,96,99,97,Kültür sanat, kitapçılar ve genç profesyonel buluşmaları`;
      setPasteData(csv);
      setFileName('ogrenci_ve_genclik_kriterleri.csv');
      parseCSVText(csv);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMsg(null);
    setSuccessMsg(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setPasteData(content);
      if (file.name.endsWith('.json')) {
        parseJSONText(content);
      } else {
        parseCSVText(content);
      }
    };
    reader.readAsText(file);
  };

  const parseCSVText = (text: string) => {
    try {
      const lines = text.trim().split('\n').filter(line => line.trim().length > 0);
      if (lines.length < 2) {
        setErrorMsg('CSV en az 1 başlık ve 1 veri satırı içermelidir.');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
      const rows = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        headers.forEach((h, idx) => {
          row[h] = values[idx];
        });
        rows.push(row);
      }

      setParsedRows(rows);
      setErrorMsg(null);
      setSuccessMsg(`${rows.length} kayıt başarıyla ayrıştırıldı.`);
    } catch (err: any) {
      setErrorMsg(`CSV ayrıştırma hatası: ${err.message}`);
    }
  };

  const parseJSONText = (text: string) => {
    try {
      const data = JSON.parse(text);
      if (Array.isArray(data)) {
        setParsedRows(data);
        setErrorMsg(null);
        setSuccessMsg(`${data.length} JSON kaydı başarıyla ayrıştırıldı.`);
      } else {
        setErrorMsg('JSON formatı bir dizi (array) olmalıdır: [ {...}, {...} ]');
      }
    } catch (err: any) {
      setErrorMsg(`JSON ayrıştırma hatası: ${err.message}`);
    }
  };

  const applyChanges = () => {
    if (parsedRows.length === 0) {
      setErrorMsg('Uygulanacak geçerli bir veri satırı bulunamadı.');
      return;
    }

    const updated = [...currentNeighborhoods];
    let addedCount = 0;
    let updatedCount = 0;

    parsedRows.forEach((row) => {
      const rawName = (row.mahalle || row.name || row.Mahalle || '').trim();
      if (!rawName) return;

      const targetName = rawName.toLowerCase();
      const existingIndex = updated.findIndex(n => 
        n.name.toLowerCase().includes(targetName) || targetName.includes(n.name.toLowerCase())
      );

      if (existingIndex !== -1) {
        const target = { ...updated[existingIndex] };
        
        // Map scores if provided
        if (row.guvenlik_skoru || row.safetyScore) {
          target.safetyScore = Number(row.guvenlik_skoru || row.safetyScore);
        }
        if (row.suc_kategori || row.crimeRateCategory) {
          target.crimeRateCategory = (row.suc_kategori || row.crimeRateCategory);
        }
        if (row.yasanabilirlik || row.livabilityScore) {
          target.livabilityScore = Number(row.yasanabilirlik || row.livabilityScore);
        }
        if (row.ortalama_kira || row.averageRent) {
          target.averageRent = Number(row.ortalama_kira || row.averageRent);
        }
        if (row.egitim_skoru || row.educationScore) {
          target.educationScore = Number(row.egitim_skoru || row.educationScore);
        }
        if (row.ulasim_skoru || row.transportScore) {
          target.transportScore = Number(row.ulasim_skoru || row.transportScore);
        }
        if (row.eglence_skoru || row.entertainmentScore) {
          target.entertainmentScore = Number(row.eglence_skoru || row.entertainmentScore);
        }
        if (row.lat || row.enlem) {
          target.lat = Number(row.lat || row.enlem);
        }
        if (row.lng || row.boylam) {
          target.lng = Number(row.lng || row.boylam);
        }
        if (row.vibe) {
          target.vibe = row.vibe;
        }

        // Recalculate verdict title if score changed
        if (target.livabilityScore >= 92) {
          target.verdictBadge = 'Mükemmel';
          target.verdictTitle = 'Kusursuz Şehir Yaşamı (5 Yıldız)';
        } else if (target.livabilityScore >= 80) {
          target.verdictBadge = 'Çok İyi';
          target.verdictTitle = 'Yüksek Yaşam Standardı (4 Yıldız)';
        } else if (target.livabilityScore >= 70) {
          target.verdictBadge = 'Orta';
          target.verdictTitle = 'Dengeli Mahalle (3.5 Yıldız)';
        } else {
          target.verdictBadge = 'Riskli';
          target.verdictTitle = 'Dikkat Gerektiren Bölge';
        }

        updated[existingIndex] = target;
        updatedCount++;
      } else {
        // Automatically add as a new neighborhood pin
        const rawDistrict = (row.ilce || row.district || row.İlçe || 'Çankaya').trim();
        
        // Coordinates: use provided or generate realistic Ankara coordinates
        const parsedLat = Number(row.lat || row.enlem);
        const parsedLng = Number(row.lng || row.boylam);
        const lat = !isNaN(parsedLat) && parsedLat > 38 && parsedLat < 41
          ? parsedLat
          : 39.89 + (Math.sin(rawName.length * 19) * 0.07);
        const lng = !isNaN(parsedLng) && parsedLng > 31 && parsedLng < 34
          ? parsedLng
          : 32.78 + (Math.cos(rawName.length * 29) * 0.08);

        const livability = Number(row.yasanabilirlik || row.livabilityScore || 79);
        const safety = Number(row.guvenlik_skoru || row.safetyScore || 77);
        const transport = Number(row.ulasim_skoru || row.transportScore || 75);
        const education = Number(row.egitim_skoru || row.educationScore || 74);
        const entertainment = Number(row.eglence_skoru || row.entertainmentScore || 72);
        const rent = Number(row.ortalama_kira || row.averageRent || 28000);

        let verdictBadge: 'Mükemmel' | 'Çok İyi' | 'Orta' | 'Riskli' | 'Tavsiye Edilmez' = 'Orta';
        let verdictTitle = 'Dengeli Mahalle (3.5 Yıldız)';
        if (livability >= 92) {
          verdictBadge = 'Mükemmel';
          verdictTitle = 'Kusursuz Şehir Yaşamı (5 Yıldız)';
        } else if (livability >= 80) {
          verdictBadge = 'Çok İyi';
          verdictTitle = 'Yüksek Yaşam Standardı (4 Yıldız)';
        } else if (livability >= 70) {
          verdictBadge = 'Orta';
          verdictTitle = 'Dengeli Mahalle (3.5 Yıldız)';
        } else if (livability >= 55) {
          verdictBadge = 'Riskli';
          verdictTitle = 'Dikkat Gerektiren Bölge';
        } else {
          verdictBadge = 'Tavsiye Edilmez';
          verdictTitle = 'Düşük Yaşam Standardı';
        }

        const newNeighborhood: NeighborhoodData = {
          id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: rawName,
          district: rawDistrict,
          lat: Number(lat.toFixed(5)),
          lng: Number(lng.toFixed(5)),
          x: 50,
          y: 50,
          provinceCoordinates: { x: 53.0, y: 46.0 },
          population: Number(row.population || row.nufus || 24000),
          averageRent: rent,
          incomeLevel: rent > 35000 ? 'Çok Yüksek' : rent > 25000 ? 'Yüksek' : 'Orta',
          livabilityScore: livability,
          safetyScore: safety,
          crimeRateCategory: row.suc_kategori || (safety >= 85 ? 'Çok Düşük' : safety >= 70 ? 'Düşük' : safety >= 55 ? 'Orta' : 'Yüksek'),
          crimeIncidentsPer1k: Number(row.crimeIncidentsPer1k || ((100 - safety) * 0.28).toFixed(1)),
          educationScore: education,
          transportScore: transport,
          entertainmentScore: entertainment,
          economyScore: Number(row.economyScore || 78),
          nearestMetroStation: row.nearestMetroStation || `${rawDistrict} EGO & Toplu Taşıma Hattı`,
          metroLines: Array.isArray(row.metroLines) ? row.metroLines : ['EGO Otobüs Ağı'],
          dailyTransitUsage: row.dailyTransitUsage || 'Yeni Eklenen Hat Verisi',
          verdictTitle,
          verdictBadge,
          verdictSummary: row.verdictSummary || `${rawName}, yüklenen veri seti üzerinden haritaya yeni pin olarak başarıyla eklenmiştir. Yaşanabilirlik puanı ${livability}/100, güvenlik puanı ise ${safety}/100 olarak hesaplanmıştır.`,
          educationDetail: row.educationDetail || `${rawDistrict} bölgesindeki okullar ve eğitim olanakları mevcuttur.`,
          transportDetail: row.transportDetail || `${rawDistrict} ana yol bağlantıları ve EGO otobüs durakları yakındır.`,
          entertainmentDetail: row.entertainmentDetail || 'Mahalle içi parklar, kafeler ve sosyal yaşam alanları.',
          safetyDetail: row.safetyDetail || `Güvenlik skoru ${safety}/100 seviyesindedir.`,
          vibe: row.vibe || 'Veri yüklemesiyle haritaya yeni eklenen dinamik Ankara mahallesi 📍✨',
          funFact: row.funFact || 'Bu mahalle haritaya kullanıcı veri seti ile eklenmiştir.',
          idealFor: ['Şehir Sakinleri', 'Yeni Yerleşim Arayanlar', 'Aileler'],
          pros: ['Google Maps üzerinde gerçek koordinatlı yeni pin', 'Özelleştirilmiş veri entegrasyonu'],
          cons: ['Daha fazla kullanıcı geri bildirimi toplanıyor'],
        };

        updated.push(newNeighborhood);
        addedCount++;
      }
    });

    onApplyDataset(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl glass-panel neon-border shadow-2xl flex flex-col text-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-slate-950/90 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-white">
                Veri Seti Yükle & Entegre Et
              </h3>
              <p className="text-xs text-slate-400">
                Kendi CSV veya JSON verinizi ekleyin; listede olmayan yeni mahalleler otomatik haritaya eklensin
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Quick Presets Buttons */}
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-2">
              Hazır Şablonlar & Test Veri Setleri:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => loadPreset('new_neighborhoods')}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 transition-colors flex items-center gap-1.5"
              >
                <span>✨ Yeni Mahalle Ekle (Yaşamkent & Beysukent)</span>
              </button>
              <button
                onClick={() => loadPreset('security2025')}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                🚨 2025 Emniyet & Güvenlik CSV
              </button>
              <button
                onClick={() => loadPreset('ego2025')}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                🚇 EGO 2025 Raylı Sistem JSON
              </button>
              <button
                onClick={() => loadPreset('student')}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                🎓 Öğrenci & Sosyal Yaşam CSV
              </button>
            </div>
          </div>

          {/* Drag & Drop / File Input */}
          <div className="border-2 border-dashed border-slate-700 hover:border-amber-500/70 rounded-2xl p-6 text-center transition-colors bg-slate-950/40">
            <Upload className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <p className="text-xs text-slate-300 font-medium">
              Bilgisayarınızdan CSV veya JSON dosyası seçin
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              (Desteklenen formatlar: .csv, .json, .txt)
            </p>
            <label className="mt-3 inline-block cursor-pointer px-4 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors">
              Dosya Seç
              <input
                type="file"
                accept=".csv,.json,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            {fileName && (
              <span className="block text-xs font-mono text-cyan-400 mt-2 font-semibold">
                Seçili dosya: {fileName}
              </span>
            )}
          </div>

          {/* Paste Raw Data Area */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Veya Veriyi Doğrudan Yapıştırın (CSV / JSON):
            </label>
            <textarea
              value={pasteData}
              onChange={(e) => {
                setPasteData(e.target.value);
                if (e.target.value.trim().startsWith('[')) {
                  parseJSONText(e.target.value);
                } else {
                  parseCSVText(e.target.value);
                }
              }}
              placeholder={`mahalle,ilce,guvenlik_skoru,suc_kategori,yasanabilirlik,ortalama_kira\nKavaklıdere & Tunalı Hilmi,Çankaya,95,Çok Düşük,98,42000`}
              rows={5}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Status Feedback */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedRows.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-1.5">
                Eşleşen Veri Önizlemesi ({parsedRows.length} satır):
              </span>
              <div className="max-h-36 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 text-xs">
                <table className="w-full text-left font-mono text-[11px]">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="p-2">Mahalle</th>
                      <th className="p-2">İlçe</th>
                      <th className="p-2">Yaşam</th>
                      <th className="p-2">Güvenlik</th>
                      <th className="p-2">Kira</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {parsedRows.slice(0, 5).map((row, i) => (
                      <tr key={i} className="hover:bg-slate-900/50">
                        <td className="p-2 font-sans font-medium text-white">{row.mahalle || row.name || '-'}</td>
                        <td className="p-2">{row.ilce || row.district || '-'}</td>
                        <td className="p-2 text-emerald-400">{row.yasanabilirlik || row.livabilityScore || '-'}</td>
                        <td className="p-2 text-rose-400">{row.guvenlik_skoru || row.safetyScore || '-'}</td>
                        <td className="p-2">{row.ortalama_kira || row.averageRent || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 bg-slate-950 border-t border-slate-800">
          <span className="text-xs text-slate-500">
            Mevcut {currentNeighborhoods.length} mahalleye uygulanacak
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Vazgeç
            </button>
            <button
              onClick={applyChanges}
              disabled={parsedRows.length === 0}
              className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Veri Setini Haritaya Uygula</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
