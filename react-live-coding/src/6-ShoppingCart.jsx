import { useState } from "react";

const products = [
  { id: 1, name: "Keyboard", price: 1200 },
  { id: 2, name: "Mouse", price: 600 },
  { id: 3, name: "Headphones", price: 2500 },
];

// Shopping Cart: add products, change quantity, remove, and show the total.
// Concepts: state as array of { ...product, qty }, reduce for the total.
export default function ShoppingCart() {
  const [cart, setCart] = useState([]);

  function addToCart(product) {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      // already in cart -> increase quantity
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      );
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  }

  function removeFromCart(id) {
    setCart(cart.filter((item) => item.id !== id));
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div>
      <h2>Products</h2>
      <ul>
        {products.map((p) => (
          <li key={p.id}>
            {p.name} - Rs.{p.price}{" "}
            <button onClick={() => addToCart(p)}>Add to cart</button>
          </li>
        ))}
      </ul>

      <h2>Cart</h2>
      {cart.length === 0 && <p>Cart is empty</p>}
      <ul>
        {cart.map((item) => (
          <li key={item.id}>
            {item.name} x {item.qty} = Rs.{item.price * item.qty}{" "}
            <button onClick={() => removeFromCart(item.id)}>Remove</button>
          </li>
        ))}
      </ul>
      <h3>Total: Rs.{total}</h3>
    </div>
  );
}
