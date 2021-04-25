import React, { Component } from "react";
import axios from 'axios';
import jwt_decode from 'jwt-decode'
import { Switch, Route, Link, BrowserRouter as Router } from "react-router-dom";

import ProductList from "./components/ProductList";
import Cart from "./components/Cart";
import Login from "./components/Login";
import Histories from "./components/Histories";

import Context from "./Context";

// const history = createHistory();

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      cart: {},
      products: [],
    };
    this.routerRef = React.createRef();
  }

  async componentDidMount() {
    let user = localStorage.getItem("user");
    let cart = localStorage.getItem("cart");

    const products = await axios.get('http://localhost:5000/products')
    user = user ? JSON.parse(user) : null;
    cart = cart ? JSON.parse(cart) : {};

    this.setState({user, products: products.data, cart})
  }
    login = async (email, password) => {
    const res = await axios.post(
      'http://localhost:5000/login',
      { email, password },
    ).catch((res) => {
      return { status: 401, message: 'Unauthorized' }
    })
      if(res.status === 200){
        const {email} = jwt_decode(res.data.accessToken)
        const user = {
          email,
          token : res.data.accessTokenm,
          accessLevel: email === 'admin@hafidz.com' ? 0:1
        }

        this.setState({user});
        localStorage.setItem("user", JSON.stringify());
        return true;
      }else{
        return false;
      }
  }

  logout= e => {
    e.preventDefault();
    this.setState({user: null});
    localStorage.removeItem("user");
  }

  addToCart = cartItem => {
    let cart = this.state.cart;
    if (cart[cartItem.id]) {
      cart[cartItem.id].amount += cartItem.amount;
    }else {
      cart[cartItem.id] = cartItem;
    }
    if (cart[cartItem.id].amount > cart[cartItem.id].product.stock){
      cart[cartItem.id].amount = cart[cartItem.id].product.stock;
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    this.setState({cart})
  };

  removeFromCart = cartItemId => {
    let cart = this.state.cart;
    delete cart[cartItemId];
    localStorage.setItem("cart", JSON.stringify(cart));
    this.setState({ cart });
  };

  clearCart = () => {
    let cart = {};
    localStorage.removeItem("cart");
    this.setState({cart});
  }

  checkout = () => {
    if (!this.state.user) {
      this.routerRef.current.history.push("/login");
      return;
    }

    const cart = this.state.cart;

    const products = this.state.products.map(p => {
      if (cart[p.name]) {
        p.stock = p.stock - cart[p.name].amount;

        axios.put(
          `http://localhost:5000/products/${p.id}`,
          {...p},
        )
      }
      return p;
    });
    this.setState({products});
    this.clearCart();
  }

  render() {
    return (
      <Context.Provider
        value={{
          ...this.state,
          removeFromCart: this.removeFromCart,
          addToCart: this.addToCart,
          login: this.login,
          clearCart: this.clearCart,
          checkout: this.checkout,
        }}
      >
        <Router ref={this.routerRef}>
          <div className="App">
            <nav
              className="navbar container"
              role="navigation"
              aria-label="main navigation"
            >
              <div className="navbar-brand">
                <b className="navbar-item is-size-5">Ujian FrontEnd</b>
                <label
                  role="button"
                  class="navbar-burger"
                  aria-label="menu"
                  aria-expanded="false"
                  data-target="navbarBasicExample"
                  onClick={(e) => {
                    e.preventDefault();
                    this.setState({ showMenu: !this.this.state.showMenu });
                  }}
                >
                  <span aria-hidden="true"></span>
                  <span aria-hidden="true"></span>
                  <span aria-hidden="true"></span>
                </label>
              </div>
              <div
                className={`navbar-menu ${
                  this.state.showMenu ? "is-active" : ""
                }`}
              >
                <Link to="/products" className="navbar-item">
                  Products
                </Link>
                <Link to="/cart" className="navbar-item">
                  Cart
                  <span
                    className="tag-is-primary"
                    style={{ marginLeft: "8px" }}
                  >
                    {Object.keys(this.state.cart).length}
                  </span>
                </Link>
                {!this.state.user ? (
                  <Link to="login" className="navbar-item">
                    Login
                  </Link>
                ) : (
                  <Link to="/" onClick={this.logout} className="navbar-item">
                    Logout
                  </Link>
                )}
              </div>
            </nav>
            <Switch>
              <Route exact path="/" component={ProductList} />
              <Route exact path="/login" component={Login} />
              <Route exact path="/cart" component={Cart} />
              <Route exact path="/products" component={ProductList} />
              <Route exact path="/histories" component={Histories} />
            </Switch>
          </div>
        </Router>
      </Context.Provider>
    );
  }
 }

