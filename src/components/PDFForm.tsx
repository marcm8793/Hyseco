import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const formSchema = z.object({
  clientName: z.string().min(2, { message: "Client name is required" }),
  clientAddress: z.string().min(2, { message: "Client address is required" }),
  devisNumber: z.string().min(1, { message: "Devis number is required" }),
  date: z.string().min(1, { message: "Date is required" }),
  validityPeriod: z.string().min(1, { message: "Validity period is required" }),
  interventionAddress: z
    .string()
    .min(2, { message: "Intervention address is required" }),
  periodicity: z.string().min(1, { message: "Periodicity is required" }),
  taskTitle: z.string().min(2, { message: "Task title is required" }),
  taskDescription: z
    .string()
    .min(2, { message: "Task description is required" }),
  priceHT: z.string().min(1, { message: "Price HT is required" }),
});

export default function PDFForm({
  onSubmit,
}: {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      clientAddress: "",
      devisNumber: "",
      date: "",
      validityPeriod: "",
      interventionAddress: "",
      periodicity: "",
      taskTitle: "",
      taskDescription: "",
      priceHT: "",
    },
  });

  function onSubmitForm(values: z.infer<typeof formSchema>) {
    onSubmit(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-8">
        <FormField
          control={form.control}
          name="clientName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter client name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Repeat this pattern for all other fields */}
        <FormField
          control={form.control}
          name="clientAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client Address</FormLabel>
              <FormControl>
                <Input placeholder="Enter client address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="devisNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Devis Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter devis number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input placeholder="Enter date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="validityPeriod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Validity Period</FormLabel>
              <FormControl>
                <Input placeholder="Enter validity period" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="interventionAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Intervention Address</FormLabel>
              <FormControl>
                <Input placeholder="Enter intervention address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="periodicity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Periodicity</FormLabel>
              <FormControl>
                <Input placeholder="Enter periodicity" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="taskTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter task title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          <label htmlFor="taskDescription">Task Description</label>
          <Controller
            name="taskDescription"
            control={form.control}
            defaultValue=""
            render={({ field }) => (
              <ReactQuill
                theme="snow"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="priceHT"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price HT</FormLabel>
              <FormControl>
                <Input placeholder="Enter price HT" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Generate PDF</Button>
      </form>
    </Form>
  );
}
