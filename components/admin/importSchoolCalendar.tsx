"use client";

import { useState } from "react";
import { parseICS } from "@/lib/calendar/parse-ics";
import { expandSchoolEvents } from "@/lib/calendar/expand-event";
import { importBlockedDays } from "@/actions/blocked-day";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ImportSchoolCalendar() {
    // decalre a type for blocked days
    type BlockedDay = {
      blocked_date: string;
      reason: string;
    };
  const [preview, setPreview] = useState<BlockedDay[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleFile(file: File) {
    const content = await file.text();

    const events = parseICS(content);

    const blockedDays = expandSchoolEvents(events);

    setPreview(blockedDays);
  }

  async function handleImport() {
    setLoading(true);

    try {
      const result = await importBlockedDays(preview);

      alert(`${result.inserted} jours bloqués importés.`);
      setPreview([]);
    } catch (error : unknown) {
        const message =
        error instanceof Error ? error.message : "Une erreur inconnue est survenue.";
        alert(message);
    } finally {
      setLoading(false);
    }
  }
  // Merge duplicate blocked days by combining their reasons utiliser 2x en faire une fonction
  const mergedDays = Array.from(
    preview.reduce((map, day) => {
      const existing = map.get(day.blocked_date);
    if (existing) {
      existing.reason = `${existing.reason} / ${day.reason}`;
    } else {
      map.set(day.blocked_date, { ...day });
    }
    return map;
  }, new Map())
  ).map(([, value]) => value);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Importer le calendrier scolaire (.ics)</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <input
          type="file"
          accept=".ics"
          onChange={(e) => {
            const file = e.target.files?.[0];

            if (file) handleFile(file);
          }}
        />

        {mergedDays.length > 0 && (
          <>
            <p>{mergedDays.length} jours seront ajoutés.</p>

            <div className="max-h-60 overflow-y-auto border rounded-md p-3">
              {mergedDays.slice(0, 100).map((day) => (
                
                <div key={day.blocked_date}>
                  {day.blocked_date} — {day.reason}
                </div>
              ))}

              {/* {preview.length > 20 && (
                <p>... {preview.length - 20} autres jours.</p>
              )*/}
            </div>

            <Button onClick={handleImport} disabled={loading}>
              {loading ? "Import..." : "Importer dans Supabase"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}