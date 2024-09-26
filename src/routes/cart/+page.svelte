<script>
    import { db } from '../../lib/firebase/firebase';
    import { authHandlers, authStore } from "../../store/store";
    import { getDoc, doc, setDoc } from 'firebase/firestore';
    import { onMount } from 'svelte';
    import Footer from '../../components/Footer.svelte';

    let cartList = [];
    let totalPrice = 0;
    let error = false;
    let userId = null;

    authStore.subscribe(curr => {
        cartList = curr.data.cart;
        userId = curr.user ? curr.user.uid : null;
        console.log(curr)
    });

    onMount(async () => {
        try {
            if (userId) {
                const userRef = doc(db, 'users', userId);
                const docSnap = await getDoc(userRef);
                if (docSnap.exists()) {
                    cartList = docSnap.data().cart;
                    console.log(cartList)
                } else {
                    console.log("No such document!");
                }
            }
        } catch (err) {
            console.error("Error fetching document: ", err);
            error = true;
        }
    });

    async function removeCart(index) {
        let newCartList = cartList.filter((val) => {
            return val.nome !== index.nome
        })
        cartList = newCartList
        try {
            const userRef = doc(db, 'users', $authStore.user.uid)
            await setDoc(userRef, { cart: cartList }, { merge: true })
        } catch (err) {
            console.log("There was an error saving your information" + err)
        }
    }
</script>

{#if !$authStore.loading}
<div class="mainContainer">
    <div class="headerContainer">
        <h1>Carrinho de compras</h1>
        <div class="headerBtns">
            <button on:click={authHandlers.logout}><i class="fa-solid fa-right-from-bracket"></i>Logout</button>
            <button on:click={() => window.location.href = "/menu"}><i class="fa-solid fa-arrow-left" aria-hidden="true"></i>Menu</button>
        </div>
    </div>
    <main>
        {#if cartList.length === 0}
        <p>
            Seu carrinho de compras está vazio
        </p>
        {/if}
        {#each cartList as todo, index}
            <div class="todo">
                <p>{todo.nome}, {todo.descricao}, R$ {todo.preco}, Quantidade: {todo.quantidade}</p>
                <button on:click={() => removeCart(todo)}>Remover do carrinho</button>
            </div>
        {/each}
        <button>Realizar Compra: {totalPrice} R$</button>
    </main>
</div>
<Footer/>
{/if}
<style>
    .mainContainer {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        gap: 24px;
        padding: 24px;
        width: 100%;
        max-width: 1000px;
        margin: 0 auto;
    }

    .headerContainer {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    button {
        background: #003c5b;
        color: white;
        padding: 10px 18px;
        border: none;
        border-radius: 4px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 10px;
    }

    button:hover {
        opacity: 0.7;
    }

    button i {
        font-size: 1.1rem;
    }

    .headerBtns {
        display: flex;
        align-items: center;
        gap: 14px;
    }

    main {
        display: flex;
        flex-direction: column;
        gap: 8px;
        flex: 1;
    }

    .todo {
        border-left: 1px solid cyan;
        padding: 4px 8px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
</style>
