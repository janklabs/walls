import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function TabSwitch({
  options,
  value,
  onValueChange,
  className,
}: {
  options: string[]
  value?: string
  onValueChange?: (value: string) => void
  className?: string
}) {
  return (
    <Tabs className="w-[400px]" value={value} onValueChange={onValueChange}>
      <TabsList className={className}>
        {options.map((option) => (
          <TabsTrigger key={option} value={option}>
            {option}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
