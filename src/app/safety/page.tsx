import LoggedInHeader from '@/components/LoggedInHeader';
import Footer from '@/components/Footer';

export default function SafetyCenterPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <LoggedInHeader />
            <main className="max-w-4xl mx-auto py-16 px-4">
                <div className="text-center">
                    <h1 className="text-5xl font-extrabold text-gray-900">Settle Safety Center</h1>
                    <p className="mt-4 text-xl text-gray-600">Your trust and safety are our highest priority.</p>
                </div>

                <div className="mt-16 space-y-12">
                    {/* Section 1 */}
                    <div className="bg-white p-8 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold text-gray-800">Before You Meet</h2>
                        <ul className="mt-4 list-disc list-inside space-y-2 text-gray-700">
                            <li><strong>Review Profiles Thoroughly:</strong> Look for detailed descriptions and verified users (a future feature).</li>
                            <li><strong>Chat Within Settle:</strong> Keep your conversation on our platform initially. Do not share personal contact information until you feel comfortable.</li>
                            <li><strong>Arrange a Video Call:</strong> A quick video chat can confirm the person's identity and give you a better sense of their personality.</li>
                            <li><strong>Meet in a Public Place:</strong> For your first in-person meeting, always choose a public place like a coffee shop.</li>
                        </ul>
                    </div>

                    {/* Section 2 */}
                    <div className="bg-white p-8 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold text-gray-800">How to Report a User</h2>
                        <p className="mt-4 text-gray-700">
                            If you encounter a profile or a message that violates our community guidelines, or if you have an unsafe experience, please report it immediately. You can find a "Report User" button on every profile page. Our moderation team will investigate every report.
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}