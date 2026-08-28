"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { updateChild } from "@/actions/user"
import { updateChildSchema } from "@/schema/user.schema"

type UpdateChildFormProps = {
  childId: number
  defaultValues: z.infer<typeof updateChildSchema>
}

export default function UpdateChildForm({ childId, defaultValues }: UpdateChildFormProps) {
  const form = useForm<z.infer<typeof updateChildSchema>>({
    resolver: zodResolver(updateChildSchema),
    defaultValues,
  })
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  const onSubmit = async ({ name, surname, schooling }: z.infer<typeof updateChildSchema>) => {
    setIsUpdating(true)

    try {
      await updateChild(childId, name, surname, schooling)
      router.push('/user/account')
    } catch (error) {
      console.error(error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="w-full max-w-2xl">
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <h3 className="font-medium text-lg">Profil</h3>
          <p className="text-muted-foreground text-sm">Mettre à jour les informations de votre enfant</p>
        </div>
        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <Field className="grid gap-2" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="name">Prénom</FieldLabel>
              <Input id="name" type="text" placeholder="Prénom" aria-invalid={fieldState.invalid} {...field} disabled={isUpdating} />
              {fieldState.error?.message && <p className="text-sm text-red-600" role="alert">{fieldState.error.message}</p>}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="surname"
          render={({ field, fieldState }) => (
            <Field className="grid gap-2" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="surname">Nom</FieldLabel>
              <Input id="surname" type="text" aria-invalid={fieldState.invalid} {...field} disabled={isUpdating} />
              {fieldState.error?.message && <p className="text-sm text-red-600" role="alert">{fieldState.error.message}</p>}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="schooling"
          render={({ field, fieldState }) => (
            <Field className="grid gap-2" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="schooling">Scolarité</FieldLabel>
              <RadioGroup
                id="schooling"
                className="w-fit"
                name={field.name}
                value={field.value ?? ""}
                onValueChange={(value) => field.onChange(value as "primary" | "preschool")}
                onBlur={field.onBlur}
                aria-invalid={fieldState.invalid}
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="primary" id="primary" disabled={isUpdating} />
                  <Label htmlFor="primary">Primaire</Label>
                </div>
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="preschool" id="preschool" disabled={isUpdating} />
                  <Label htmlFor="preschool">Maternelle</Label>
                </div>
              </RadioGroup>
              {fieldState.error?.message && <p className="text-sm text-red-600" role="alert">{fieldState.error.message}</p>}
            </Field>
          )}
        />
        <div className="flex gap-2">
          <Button type="submit" disabled={isUpdating}>Appliquer les modifications</Button>
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isUpdating}>Annuler</Button>
        </div>
      </form>
    </div>
  )
}
