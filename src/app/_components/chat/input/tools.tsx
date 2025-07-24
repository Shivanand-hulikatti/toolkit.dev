import { Button } from "@/components/ui/button";
import {
  TooltipContent,
  TooltipTrigger,
  Tooltip,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Loader2, Save, Wrench } from "lucide-react";
import { useChatContext } from "@/app/_contexts/chat-context";
import { useEffect, useState } from "react";
import { ToolkitList } from "@/components/toolkit/toolkit-list";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { ToolkitIcons } from "@/components/toolkit/toolkit-icons";
import { clientToolkits } from "@/toolkits/toolkits/client";
import { LanguageModelCapability } from "@/ai/types";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { DropdownMenuContent } from "@/components/ui/dropdown-menu";

export const ToolsSelect = () => {
  const { toolkits, addToolkit, removeToolkit, workbench, selectedChatModel } =
    useChatContext();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(
    Object.keys(clientToolkits).some((toolkit) => searchParams.get(toolkit)),
  );
  const router = useRouter();

  useEffect(() => {
    if (
      !isOpen &&
      Object.keys(clientToolkits).some((toolkit) => searchParams.get(toolkit))
    ) {
      setIsOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { mutate: updateWorkbench, isPending } =
    api.workbenches.updateWorkbench.useMutation({
      onSuccess: () => {
        toast.success("Workbench updated successfully");
        router.refresh();
        setIsOpen(false);
      },
    });

  const handleSave = () => {
    if (workbench) {
      updateWorkbench({
        id: workbench.id,
        name: workbench.name,
        systemPrompt: workbench.systemPrompt,
        toolkitIds: toolkits.map((toolkit) => toolkit.id),
      });
    }
  };

  if (
    selectedChatModel &&
    !selectedChatModel.capabilities?.includes(
      LanguageModelCapability.ToolCalling,
    )
  ) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={"outline"}
              className="w-fit cursor-not-allowed justify-start bg-transparent opacity-50 md:w-auto md:px-2"
            >
              <Wrench />
              <span className="hidden md:block">Add Toolkits</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>This model does not support tool calling</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-fit justify-center bg-transparent md:w-auto md:px-2",
              toolkits.length === 0 && "size-9 md:w-auto",
            )}
            disabled={
              !selectedChatModel?.capabilities?.includes(
                LanguageModelCapability.ToolCalling,
              )
            }
          >
            {toolkits.length > 0 ? (
              <ToolkitIcons toolkits={toolkits.map((toolkit) => toolkit.id)} />
            ) : (
              <Wrench />
            )}
            <span className="hidden md:block">
              {toolkits.length > 0
                ? `${toolkits.length} Toolkit${toolkits.length > 1 ? "s" : ""}`
                : "Add Toolkits"}
            </span>
          </Button>
        </DropdownMenuTrigger>

       <DropdownMenuContent
          className="w-xs overflow-hidden p-0 md:w-lg"
          align="start"
          sideOffset={8}
        >
          <div className="bg-background sticky top-0 z-10 border-b p-2">
            <h2 className="mb-1 text-sm font-bold">Toolkit Selector</h2>
            <div className="text-muted-foreground text-sm">
              Add or remove tools to enhance your chat experience
            </div>
          </div>
          <div className="max-h-56 w-full pl-2 pr-1 py-2 max-w-full overflow-x-hidden overflow-y-auto md:max-h-80">
            <ToolkitList
              selectedToolkits={toolkits}
              onAddToolkit={addToolkit}
              onRemoveToolkit={removeToolkit}
            />
            {workbench !== undefined && (
              <div className="p-2 border-t">
                <Button
                  variant={"outline"}
                  className="bg-transparent w-full"
                  onClick={handleSave}
                  disabled={isPending}
                >
                  {isPending ? <Loader2 className="animate-spin" /> : <Save />}
                  Save
                </Button>
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
};
