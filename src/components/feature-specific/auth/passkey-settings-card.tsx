import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { deletePasskey, listPasskeys, PasskeySummary, registerPasskey } from "@/services/auth-service";
import { KeyRound, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

export function PasskeySettingsCard() {
  const { toast } = useToast();
  const [passkeys, setPasskeys] = useState<PasskeySummary[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const loadPasskeys = async () => {
    setLoading(true);
    try {
      const response = await listPasskeys();
      setPasskeys(response.data ?? []);
    } catch (error) {
      toast({
        title: "Could not load passkeys",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    listPasskeys()
      .then((response) => {
        if (active) {
          setPasskeys(response.data ?? []);
        }
      })
      .catch((error: unknown) => {
        if (!active) {
          return;
        }
        toast({
          title: "Could not load passkeys",
          description: error instanceof Error ? error.message : "Please try again.",
          variant: "destructive",
        });
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [toast]);

  const handleAdd = async () => {
    setBusy(true);
    try {
      await registerPasskey(name.trim());
      setName("");
      toast({
        title: "Passkey added",
        description: "You can now sign in with this passkey.",
      });
      await loadPasskeys();
    } catch (error) {
      toast({
        title: "Passkey was not added",
        description: error instanceof Error ? error.message : "The passkey prompt was cancelled.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (passkey: PasskeySummary) => {
    if (!window.confirm(`Remove the passkey "${passkey.name}"? Password sign-in will still work.`)) {
      return;
    }
    setBusy(true);
    try {
      await deletePasskey(passkey.id);
      toast({
        title: "Passkey removed",
        description: "Password sign-in is unchanged.",
      });
      await loadPasskeys();
    } catch (error) {
      toast({
        title: "Could not remove passkey",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Passkeys</CardTitle>
        </div>
        <CardDescription>
          Add a passkey for this administrator account. Password sign-in stays available if you remove every passkey.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading passkeys...</p>
        ) : passkeys.length === 0 ? (
          <p className="text-sm text-muted-foreground">No passkeys yet.</p>
        ) : (
          <ul className="space-y-2">
            {passkeys.map((passkey) => (
              <li
                key={passkey.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{passkey.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Added {new Date(passkey.created_at).toLocaleDateString()}
                    {passkey.last_used_at
                      ? ` · Last used ${new Date(passkey.last_used_at).toLocaleDateString()}`
                      : ""}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={busy}
                  onClick={() => void handleDelete(passkey)}
                  aria-label={`Remove ${passkey.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Name this passkey, e.g. MacBook"
            maxLength={80}
            disabled={busy}
            aria-label="Passkey name"
          />
          <Button type="button" onClick={() => void handleAdd()} disabled={busy} className="sm:w-auto">
            {busy ? "Waiting..." : "Add passkey"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
