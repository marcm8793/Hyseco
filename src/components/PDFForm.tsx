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
import { DatePicker } from "@/components/ui/date-picker";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export const formSchema = z.object({
  clientFirstName: z.string().min(2, { message: "First name is required" }),
  clientLastName: z.string().min(2, { message: "Last name is required" }),
  clientStreet: z.string().min(2, { message: "Street is required" }),
  clientCity: z.string().min(2, { message: "City is required" }),
  clientPostalCode: z.string().min(2, { message: "Postal code is required" }),
  devisNumber: z.string().min(1, { message: "Devis number is required" }),
  date: z.date({ required_error: "Date is required" }),
  validityPeriod: z.string().min(1, { message: "Validity period is required" }),
  interventionStreet: z.string().min(2, { message: "Street is required" }),
  interventionCity: z.string().min(2, { message: "City is required" }),
  interventionPostalCode: z
    .string()
    .min(2, { message: "Postal code is required" }),
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
      clientFirstName: "",
      clientLastName: "",
      clientStreet: "",
      clientCity: "",
      clientPostalCode: "",
      devisNumber: "",
      date: new Date(),
      validityPeriod: "",
      interventionStreet: "",
      interventionCity: "",
      interventionPostalCode: "",
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
        <div className="flex flex-wrap gap-4">
          <FormField
            control={form.control}
            name="clientFirstName"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Prénom</FormLabel>
                <FormControl>
                  <Input placeholder="Enter first name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="clientLastName"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Nom</FormLabel>
                <FormControl>
                  <Input placeholder="Enter last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <FormField
            control={form.control}
            name="clientStreet"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Rue</FormLabel>
                <FormControl>
                  <Input placeholder="Enter street" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="clientCity"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Ville</FormLabel>
                <FormControl>
                  <Input placeholder="Enter city" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="clientPostalCode"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Code Postal</FormLabel>
                <FormControl>
                  <Input placeholder="Enter postal code" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
                <DatePicker date={field.value} onSelect={field.onChange} />
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

        <div className="flex flex-wrap gap-4">
          <FormField
            control={form.control}
            name="interventionStreet"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Rue d&apos;intervention</FormLabel>
                <FormControl>
                  <Input placeholder="Enter intervention street" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="interventionCity"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Ville d&apos;intervention</FormLabel>
                <FormControl>
                  <Input placeholder="Enter intervention city" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="interventionPostalCode"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Code Postal d&apos;intervention</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter intervention postal code"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
