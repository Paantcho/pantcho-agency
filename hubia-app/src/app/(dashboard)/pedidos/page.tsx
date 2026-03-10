import { getPedidos, getCreatorsForSelect } from "./actions";
import PedidosClient from "./pedidos-client";

export default async function PedidosPage() {
  const [pedidos, creators] = await Promise.all([
    getPedidos(),
    getCreatorsForSelect(),
  ]);

  return <PedidosClient pedidos={pedidos} creators={creators} />;
}
