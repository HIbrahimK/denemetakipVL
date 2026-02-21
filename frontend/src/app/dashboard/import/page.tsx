import { ImportWizard } from '@/components/import-wizard';

const examTemplates = [
    { label: 'AYT Şablonu', href: '/dosyalar/AYTSablon.xlsx' },
    { label: 'TYT Şablonu', href: '/dosyalar/TYTSablon.xlsx' },
    { label: 'LGS Şablonu', href: '/dosyalar/lgsSablon (1).xls' },
];

export default function ImportPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Sınav Sonuçlarını İçe Aktar
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Excel dosyalarınızı yükleyerek sistemin otomatik analiz yapmasını sağlayın.
                </p>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4">
                <p className="text-sm font-medium mb-2">Örnek şablonlar</p>
                <div className="flex flex-wrap gap-2">
                    {examTemplates.map((template) => (
                        <a
                            key={template.href}
                            href={template.href}
                            download
                            className="inline-flex items-center rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm hover:bg-white dark:hover:bg-slate-800"
                        >
                            {template.label}
                        </a>
                    ))}
                </div>
            </div>

            <div className="grid gap-8">
                <ImportWizard />
            </div>
        </div>
    );
}
