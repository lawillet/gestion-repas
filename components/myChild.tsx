
import { Pencil, Plus, User, Users } from 'lucide-react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

type Child = {
  id: number
  name: string
  surname: string
  schooling: string
}

type MyChildProps = {
  childList: Child[]
}

const MyChild = ({ childList }: MyChildProps) => {
  return (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-2xl font-semibold text-primary">
            Mes enfants
          </CardTitle>
          {childList.length > 0 && (
            <Button  
              size="sm"
              nativeButton={false}
              render={<Link href="/user/addChild" />}
            >
              <Plus className="mr-1 h-4 w-4" />
              Ajouter un enfant
            </Button>
          )}
        </CardHeader>

        <CardContent>
          {childList.length > 0 ? (
            <ul className="space-y-3">
              {childList.map((child) => (
                <li
                  key={child.id}
                  className="flex items-center justify-between gap-4 rounded-lg border 
                  bg-card p-4 transition-colors hover:bg-accent/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center 
                    rounded-full bg-primary/10 text-primary">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {child.name} {child.surname}
                      </p>
                      <Badge  className="mt-1">
                        {child.schooling == 'primary' ? 'Primaire' : 'Maternelle'}
                      </Badge>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm"
                    nativeButton={false}
                    render={<Link href={`/user/account/${child.id}`} />}
                  >
                    <Pencil className="mr-1 h-4 w-4" />
                    Modifier
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed py-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Users className="h-7 w-7" />
              </div>
              <p className="text-muted-foreground">
                Vous n&apos;avez pas d&apos;enfant enregistré.
              </p>
              <Button
                nativeButton={false}
                render={<Link href="/user/addChild" />}
              >
                <Plus className="mr-1 h-4 w-4" />
                Ajouter un enfant
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
  )
}

export default MyChild