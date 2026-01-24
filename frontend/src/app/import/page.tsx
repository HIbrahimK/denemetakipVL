import { ImportWizard } from "@/components/import-wizard";

export default function ImportPage() {
    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-10">
            <div className="mx-auto max-w-7xl space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Sınav Sonuçlarını İçe Aktar</h1>
                    <p className="text-slate-500">Excel dosyalarınızı yükleyerek sistemin otomatik analiz yapmasını sağlayın.</p>
                </div>

                <div className="grid gap-8">
                    <ImportWizard />
                </div>
            </div>
        </div>
    );
}
