import React from "react";

const ProductItem = props => {
    const {product} = props; 
    return (
        <div className="column is-half">
            <div className="box">
                <div className ="media">
                   <div className ="media-left">
                       <figure className="image is 64x64"></figure>
                       </div>
                       <div className="media-content">
                           <b>
                               {product.name}{" "}
                               <span className="tag-is-primary">Rp{product.price}</span>
                           </b>
                           <div>{product.description}</div>
                           {product.stock > 0 ? (
                               <small>{product.stock + "Available"}</small>
                               ) : (
                                   <small className="has-text-danger">HABIS</small>
                               )}
                               <div className="is-clearfix">
                                   <button className="button is-small is-outlined is-primary is-pulled-right" 
                                   onClick={() => props.addToCart({
                                       id: product.name,
                                       product,
                                       amount: 1
                                   })
                                   }>
                                       Tambahkan ke keranjang
                                   </button>
                               </div>
                       </div>
                </div>
            </div>
        </div>
    );
};

export default ProductItem;