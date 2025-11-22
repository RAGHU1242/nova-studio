import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

const Toaster = ({ ...props }) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme}
      toastOptions={{
        classNames: {
          toast:
            "bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/10 text-foreground shadow-xl",
          description: "text-muted-foreground",
          actionButton:
            "bg-primary text-primary-foreground backdrop-blur-md",
          cancelButton:
            "bg-white/10 border border-white/10 text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
