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
import { updatePrice } from "@/actions/admin"
import { updatePriceSchema, type UpdatePriceFormValues } from "@/schema/admin.schema"

type UpdatePriceFormProps = {
  mealId: number
  defaultValues: UpdatePriceFormValues
}

export default function UpdatePriceForm({ mealId, defaultValues }: UpdatePriceFormProps) {
  const form = useForm({
    resolver: zodResolver(updatePriceSchema),
    defaultValues,
  })
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  const onSubmit = async ({ price, portion, type }: UpdatePriceFormValues) => {
    setIsUpdating(true)

    try {
      await updatePrice(mealId, price, portion, type)
      router.push('/admin/price')
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
          name="price"
          render={({ field, fieldState }) => (
            <Field className="grid gap-2" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="name">Prix</FieldLabel>
              <Input
                id="name"
                type="number"
                aria-invalid={fieldState.invalid}
                value={typeof field.value === 'number' ? field.value : ''}
                onChange={(event) => 
                  field.onChange(event.target.value === '' ? '' : Number(event.target.value))}
                disabled={isUpdating}
              />
              {
                fieldState.error?.message && 
                <p className="text-sm text-red-600" role="alert">
                  {fieldState.error.message}
                </p>
              }
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="portion"
          render={({ field, fieldState }) => (
            <Field className="grid gap-2" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="schooling">Portion</FieldLabel>
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
              {
                fieldState.error?.message && 
                <p className="text-sm text-red-600" role="alert">
                  {fieldState.error.message}
                </p>
              }
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="type"
          render={({ field, fieldState }) => (
            <Field className="grid gap-2" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="schooling">Type de repas</FieldLabel>
              <RadioGroup
                id="schooling"
                className="w-fit"
                name={field.name}
                value={field.value ?? ""}
                onValueChange={(value) => field.onChange(value as "soup" | "meal")}
                onBlur={field.onBlur}
                aria-invalid={fieldState.invalid}
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="soup" id="soup" disabled={isUpdating} />
                  <Label htmlFor="primary">Soupe</Label>
                </div>
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="meal" id="meal" disabled={isUpdating} />
                  <Label htmlFor="preschool">
                    Repas chaud
                  </Label>
                </div>
              </RadioGroup>
              {
                fieldState.error?.message && 
                <p className="text-sm text-red-600" role="alert">
                  {fieldState.error.message}
                </p>
              }
            </Field>
          )}
        />
        <div className="flex gap-2">
          <Button type="submit" disabled={isUpdating}>
            Appliquer les modifications
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()} disabled={isUpdating}
          >
            Annuler
          </Button>
        </div>
      </form>
    </div>
  )
}
