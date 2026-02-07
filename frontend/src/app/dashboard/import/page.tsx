import { ImportWizard } from "@/components/import-wizard";

export default function ImportPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Sınav Sonuçlarını İçe Aktar</h1>
                <p className="text-slate-500 dark:text-slate-400">Excel dosyalarınızı yükleyerek sistemin otomatik analiz yapmasını sağlayın.</p>
            </div>

            <div className="grid gap-8">
                <ImportWizard />
            </div>
        </div>
    );
}
