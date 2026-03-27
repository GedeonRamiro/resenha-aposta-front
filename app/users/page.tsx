import Link from "next/link";

import PaginationShadcn from "@/components/PaginationShadcn";
import TiTleSeparator from "@/components/TiTleSeparator";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getUsers } from "@/lib/users";

export default async function Users({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    userId?: string;
  }>;
}) {
  const params = await searchParams;
  const currentPage = Number.parseInt(params.page ?? "1");

  let users = null;
  let usersError = "";

  try {
    users = await getUsers(currentPage);
  } catch (error: unknown) {
    usersError =
      error instanceof Error
        ? error.message
        : "Não foi possível carregar a lista de usuários.";
  }

  const hasUserList = Boolean(users && Array.isArray(users.data));
  const usersData = users?.data ?? [];

  return (
    <>
      <TiTleSeparator title="Todos os Usuários" />

      <Card>
        <CardHeader>
          <CardTitle>Lista de usuários</CardTitle>
        </CardHeader>
        <CardContent>
          {usersError ? (
            <p className="text-sm text-red-600">{usersError}</p>
          ) : null}

          {!hasUserList ? (
            <p className="text-sm text-muted-foreground">
              Não foi possível carregar os dados de usuários.
            </p>
          ) : usersData.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum usuário encontrado.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersData.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <UserAvatar name={user.name} image={user.image} />
                        <span className="truncate font-medium">
                          {user.name?.trim() || "Usuário sem nome"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/users/${user.id}`}>Ver detalhes</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {hasUserList && usersData.length !== 0 ? (
        <div className="py-4">
          <PaginationShadcn
            count={users?.count}
            currentPage={currentPage}
            nextPage={users?.nextPage}
            lastPage={users?.lastPage}
            prevPage={users?.prevPage}
          />
        </div>
      ) : null}
    </>
  );
}
