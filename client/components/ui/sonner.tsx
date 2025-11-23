import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/10 text-foreground shadow-2xl rounded-xl transition-all duration-300",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:backdrop-blur-md group-[.toast]:shadow-md group-[.toast]:transition-transform group-[.toast]:hover:scale-105",
          cancelButton:
            "group-[.toast]:bg-white/10 group-[.toast]:border-white/10 group-[.toast]:text-muted-foreground group-[.toast]:transition-colors group-[.toast]:hover:bg-white/20",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };