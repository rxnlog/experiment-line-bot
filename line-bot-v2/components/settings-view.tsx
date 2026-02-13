'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// NOTE: Hardcoded auth is out of scope for this POC. This mimics a JWT login 
// to streamline development and is expected to be replaced by actual auth.
const fetcher = (url: string) => fetch(url, {
    headers: { 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_KEY || 'hardcoded_secret_key_12345'}` }
}).then((res) => res.json());

export default function SettingsView() {
    const { data: settings, mutate } = useSWR('/api/settings/bot', fetcher);
    const [formData, setFormData] = useState({
        bot_name: '',
        bot_avatar_url: '',
        system_prompt_template: '',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (settings) {
            setFormData({
                bot_name: settings.bot_name || '',
                bot_avatar_url: settings.bot_avatar_url || '',
                system_prompt_template: settings.system_prompt_template || '',
            });
        }
    }, [settings]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/settings/bot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // NOTE: Hardcoded auth is out of scope for this POC.
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_KEY || 'hardcoded_secret_key_12345'}`
                },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                alert('Settings saved successfully');
                mutate();
            } else {
                alert('Failed to save settings');
            }
        } catch (error) {
            console.error(error);
            alert('Error saving settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto w-full">
            <Card>
                <CardHeader>
                    <CardTitle>ตั้งค่าบอท</CardTitle>
                    <CardDescription>ปรับแต่งตัวตนและพฤติกรรมของ AI</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="bot_name">ชื่อบอท</Label>
                            <Input
                                id="bot_name"
                                value={formData.bot_name}
                                onChange={(e) => setFormData({ ...formData, bot_name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="prompt">คำสั่งระบบ (System Instruction)</Label>
                            <Textarea
                                id="prompt"
                                value={formData.system_prompt_template}
                                onChange={(e) => setFormData({ ...formData, system_prompt_template: e.target.value })}
                                className="min-h-[600px] text-sm leading-relaxed"
                                placeholder="คุณคือผู้ช่วยอัจฉริยะ..."
                            />
                        </div>
                        <Button type="submit" disabled={loading} className="w-full sm:w-auto cursor-pointer font-bold">
                            {loading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
