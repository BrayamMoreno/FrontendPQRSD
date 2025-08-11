"use client"

import { useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Switch } from "./ui/switch"

type Role = { id: string | number; nombre: string }

const schema = z.object({
    nombre: z.string().min(1, "Requerido"),
    apellido: z.string().min(1, "Requerido"),
    dni: z.string().min(3, "Requerido"),
    correo: z.string().email("Correo inválido"),
    rolId: z.string().min(1, "Seleccione un rol"),
    isEnable: z.boolean().default(true),
})

export type AccountFormValues = z.infer<typeof schema>

function AccountForm({
    defaultValues,
    roles,
    onSubmit,
    submitLabel,
}: {
    defaultValues: Partial<AccountFormValues>
    roles: Role[]
    onSubmit: (values: AccountFormValues) => Promise<void> | void
    submitLabel: string
}) {
    const form = useForm<AccountFormValues>({
        defaultValues,
        resolver: zodResolver(schema), // si usas validación zod
    })

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
                <FormField
                    control={form.control}
                    name="nombre"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombres</FormLabel>
                            <FormControl>
                                <Input placeholder="Nombres" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {/* ... resto de campos igual pero todos con control={form.control} */}
                <div className="md:col-span-2 flex justify-end gap-2">
                    <Button type="submit">{submitLabel}</Button>
                </div>
            </form>
        </Form>
    )
}


export function AccountCreateModal({
    open,
    onOpenChange,
    roles,
    onCreate,
}: {
    open: boolean
    onOpenChange: (v: boolean) => void
    roles: Role[]
    onCreate: (values: AccountFormValues) => Promise<void> | void
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Nuevo usuario</DialogTitle>
                    <DialogDescription>Complete los campos para crear una nueva cuenta.</DialogDescription>
                </DialogHeader>
                <AccountForm defaultValues={{}} roles={roles} onSubmit={onCreate} submitLabel="Crear cuenta" />
            </DialogContent>
        </Dialog>
    )
}

export function AccountEditModal({
    open,
    onOpenChange,
    roles,
    user,
    onUpdate,
}: {
    open: boolean
    onOpenChange: (v: boolean) => void
    roles: Role[]
    user: any | null
    onUpdate: (values: AccountFormValues) => Promise<void> | void
}) {
    const defaults: Partial<AccountFormValues> = user
        ? {
            nombre: user?.persona?.nombre ?? "",
            apellido: user?.persona?.apellido ?? "",
            dni: user?.persona?.dni ?? "",
            correo: user?.correo ?? "",
            rolId: String(user?.rol?.id ?? ""),
            isEnable: Boolean(user?.isEnable),
        }
        : {}

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Editar usuario</DialogTitle>
                    <DialogDescription>Actualiza la información de la cuenta seleccionada.</DialogDescription>
                </DialogHeader>
                <AccountForm defaultValues={defaults} roles={roles} onSubmit={onUpdate} submitLabel="Guardar cambios" />
            </DialogContent>
        </Dialog>
    )
}
function zodResolver(schema: z.ZodObject<{ nombre: z.ZodString; apellido: z.ZodString; dni: z.ZodString; correo: z.ZodString; rolId: z.ZodString; isEnable: z.ZodDefault<z.ZodBoolean> }, "strip", z.ZodTypeAny, { nombre: string; apellido: string; dni: string; correo: string; rolId: string; isEnable: boolean }, { nombre: string; apellido: string; dni: string; correo: string; rolId: string; isEnable?: boolean | undefined }>): import("react-hook-form").Resolver<{ nombre: string; apellido: string; dni: string; correo: string; rolId: string; isEnable: boolean }, any, { nombre: string; apellido: string; dni: string; correo: string; rolId: string; isEnable: boolean }> | undefined {
    throw new Error("Function not implemented.")
}

