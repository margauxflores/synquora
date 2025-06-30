"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function CreateEventDialog() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { mutate: createEvent, isPending } = trpc.event.create.useMutation({
    onSuccess: (event) => {
      toast.success("Event created!");
      setTimeout(() => {
        setOpen(false);
        setName("");
        setDescription("");
        utils.event.list.invalidate();
        router.push(`/events/${event.id}`);
      }, 500);
    },
    onError: () => {
      toast.error("Something went wrong while creating the event.");
    },
  });

  return (
    <Dialog open={open} onOpenChange={(val) => !isPending && setOpen(val)}>
      <DialogTrigger asChild>
        <Button>Create Event</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Event</DialogTitle>
          <DialogDescription>Give your event a name and short description.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-4">
          <Input
            placeholder="Event name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
          />
          <Input
            placeholder="Short description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isPending}
          />
          <Button
            onClick={() => createEvent({ name, description })}
            disabled={isPending || !name.trim()}
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </span>
            ) : (
              "Create Event"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
