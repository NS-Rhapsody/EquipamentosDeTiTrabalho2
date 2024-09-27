<script>
    import { onMount } from "svelte";
    import Footer from "../../components/Footer.svelte";
    import { auth, db, storage } from "../../lib/firebase/firebase";
    import { authHandlers, authStore } from "../../store/store";
    import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
    import {
        setDoc,
        getDocs,
        doc,
        collection,
        addDoc,
        updateDoc,
    } from "firebase/firestore";

    let dados = [];
    let productList = [];
    let productToAdd = [];
    let filterStyle = "";
    let name = "";
    let description = "";
    let price = "";
    let amountToChose = false;
    let amount = 1;
    let mode = 1;
    let imageFile = null;
    let currentPage = 1;
    const productsPerPage = 20;
    let maxPage;
    let isEditing = false;
    let productToEdit = null;
    let currentPageProducts = []; // Variável para armazenar os produtos da página atual

    function handleFileSelect(event) {
        imageFile = event.target.files[0];
    }

    authStore.subscribe((curr) => {
        console.log(curr)
        productList = curr.data?.cart || [];
    });

    onMount(async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "products"));
            dados = querySnapshot.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
            }));
            dados = [...dados];
            maxPage = Math.ceil(dados.length / productsPerPage);
            getCurrentPageProducts(); // Chama a função para carregar os produtos da primeira página
        } catch (error) {
            console.error("Erro ao carregar produtos:", error);
        }
    });

    async function addProductToMenu(name, description, price) {
        if (!imageFile && !isEditing) {
            alert("Selecione uma imagem para o produto.");
            return;
        }

        try {
            let imageUrl = productToEdit?.imagemUrl || "";
            if (imageFile) {
                const storageRef = ref(storage, `products/${imageFile.name}`);
                const snapshot = await uploadBytes(storageRef, imageFile);
                imageUrl = await getDownloadURL(snapshot.ref);
            }

            const dataToSetToStore = {
                nome: name,
                descricao: description,
                preco: price,
                imagemUrl: imageUrl,
            };

            if (isEditing && productToEdit) {
                const productRef = doc(db, "products", productToEdit.id);
                await updateDoc(productRef, dataToSetToStore);
                isEditing = false;
                productToEdit = null;
            } else {
                await addDoc(collection(db, "products"), dataToSetToStore);
            }

            location.reload();
        } catch (error) {
            console.error("Erro ao adicionar/editar o produto:", error);
        }
    }

    function startEdit(product) {
        isEditing = true;
        productToEdit = product;
        name = product.nome;
        description = product.descricao;
        price = product.preco;
        imageFile = product.imagemUrl
        mode = 0;
    }

    async function saveCart(product) {
        const productObj = {
            nome: product.nome,
            descricao: product.descricao,
            preco: product.preco,
            image: product.imagemUrl,
            quantidade: amount,
        };
        productList = [...productList, productObj];

        try {
            const userRef = doc(db, "users", $authStore.user.uid);
            await setDoc(userRef, { cart: productList }, { merge: true });
        } catch (err) {
            console.log("Erro ao salvar informações no carrinho:", err);
        }

        productToAdd = [];
        amount = 1;
        amountToChose = false;
    }

    function choseAmount(index) {
        productToAdd = index;
        amountToChose = true;
    }

    function handleFilter() {
        if (filterStyle === "Alfabetico") {
            dados = [...dados].sort((a, b) =>
                a.nome.localeCompare(b.nome, "pt", { sensitivity: "base" }),
            );
        } else if (filterStyle === "Menor preço") {
            dados = [...dados].sort((a, b) => a.preco - b.preco);
        } else if (filterStyle === "Maior preço") {
            dados = [...dados].sort((a, b) => b.preco - a.preco);
        }
        maxPage = Math.ceil(dados.length / productsPerPage); // Atualiza o número máximo de páginas
        currentPage = 1; // Reseta para a primeira página ao aplicar um filtro
        getCurrentPageProducts(); // Atualiza a exibição com o filtro aplicado
    }

    function changePage(newPage) {
        if (newPage > 0 && newPage <= maxPage) {
            currentPage = newPage;
            getCurrentPageProducts(); // Atualiza os produtos na página atual
        }
    }

    function getCurrentPageProducts() {
        const startIndex = (currentPage - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        currentPageProducts = dados.slice(startIndex, endIndex); // Atualiza a lista de produtos da página atual
    }
</script>

<div class="mainContainer">
    <div class="headerContainer">
        <h1>Menu principal</h1>
        <div class="headerBtns">
            <button on:click={() => (window.location.href = "/cart")}
                ><i class="fa-solid fa-cart-shopping"></i>Carrinho</button
            >
            <button on:click={authHandlers.logout}
                ><i class="fa-solid fa-right-from-bracket"></i>Logout</button
            >
            {#if mode}
                <button on:click={() => (mode = 0)}
                    ><i class="fa-solid fa-plus"></i>Adicionar produto</button
                >
            {:else}
                <button on:click={() => (mode = 1)}
                    ><i class="fa-solid fa-arrow-left"></i>Menu</button
                >
            {/if}
            <select bind:value={filterStyle} on:change={handleFilter}>
                <option value="" disabled selected>Filtro</option>
                <option value="Alfabetico">Alfabetico</option>
                <option value="Menor preço">Menor preço</option>
                <option value="Maior preço">Maior preço</option>
            </select>
        </div>
        <img src="Flaviotec w.svg" alt="" />
    </div>

    {#if mode}
        <div class="listProductsContainer">
            {#each currentPageProducts as dado, index}
                <div class="listProduct" key={index}>
                    <div class="product">
                        <h2>{dado.nome}</h2>
                        <p>{dado.descricao}</p>
                        {#if dado.imagemUrl}
                            <img src={dado.imagemUrl} alt={dado.nome} />
                        {/if}
                    </div>
                    <div class="economics">
                        <p>{dado.preco} R$</p>
                        <button on:click={() => choseAmount(dado)}
                            >Adicionar ao carrinho</button
                        >
                        <button on:click={() => startEdit(dado)}>Editar</button>
                        <!-- Botão de Editar -->
                    </div>
                </div>
            {/each}
        </div>

        <div class="pagination">
            <button
                on:click={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}>Anterior</button
            >
            <span>Página {currentPage} de {maxPage}</span>
            <button
                on:click={() => changePage(currentPage + 1)}
                disabled={currentPage === maxPage}>Próximo</button
            >
        </div>
    {:else}
    <div class="edit">
        <h2>{isEditing ? "Editar produto" : "Adicionar produto"}</h2>
        <!-- Mudança no título -->
        <form>
            <input
                type="text"
                bind:value={name}
                required
                placeholder="Nome do produto"
            />
            <input
                type="text"
                bind:value={description}
                required
                placeholder="Descrição do produto"
            />
            <input
                type="number"
                bind:value={price}
                required
                placeholder="Preço do produto"
            />
            <input
                type="file"
                accept="image/*"
                on:change={handleFileSelect}
                required={!isEditing}
            />
            <!-- Não requer imagem ao editar -->
            <button
                type="button"
                on:click={() => addProductToMenu(name, description, price)}
            >
                {isEditing ? "Salvar alterações" : "Adicionar produto"}
            </button>
        </form>
    </div>
    {/if}
</div>

{#if amountToChose}
    <div class="pop-up-quantity">
        <div class="pop-up">
            <h2>Selecione a quantidade do produto que você deseja adicionar</h2>
            <div>
                <p>{productToAdd.nome}</p>
                <p>{productToAdd.descricao}</p>
                <p>R$ {productToAdd.preco}</p>
            </div>
            <div class="amount">
                <i
                    class="fa-solid fa-minus"
                    aria-hidden="true"
                    on:click={() => (amount = Math.max(1, amount - 1))}
                ></i>
                <p>{amount}</p>
                <i
                    class="fa-solid fa-plus"
                    aria-hidden="true"
                    on:click={() => amount++}
                ></i>
            </div>
            <button on:click={() => saveCart(productToAdd)}>Confirmar</button>
        </div>
    </div>
{/if}
<Footer />

<style>
    .mainContainer {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        justify-content: center;
        width: 100%;
        margin: 0 auto;
    }

    .headerContainer {
        margin-bottom: 3%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%; /* Alarga o header para a largura completa da viewport */
        margin-left: calc(
            -50vw + 50%
        );/* Compensa o margin do body para alinhar corretamente */
        padding: 0px 24px; /* Adiciona o padding lateral, se necessário */
        box-sizing: border-box; /* Garante que o padding não afete a largura total */
        background-color: #000425;
    }
    .headerContainer img {
        width: 60px;
    }
    .headerBtns {
        display: flex;
        align-items: center;
        gap: 14px;
    }

    .listProduct {
        display: flex;
        flex-direction: column;
        padding: 20px;
        border-radius: 8px;
        text-align: center;
        background-color: rgb(18, 18, 102);
    }

    .listProductsContainer {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        width: 80%;
        height: 100%;
        margin: 0 auto;
    }

    .pagination{
        margin-bottom: 20px;
    }

    .product img {
        width: 100px;
        height: 100px;
        object-fit: cover;
        border-radius: 4px;
        margin-bottom: 0 auto;
        margin: 5% 35%;
    }
    .product h2{
        height: 80px;
        margin-bottom: 10px;
        overflow: hidden;
    }
    .product {
        max-width: 100%;
        height: 90%;
        display: flex;
        flex-direction: column;
        align-content: center;
        margin: 0 auto;
        gap: 10px; /* Define o espaçamento entre os itens internos do div */
        padding: 20px; /* Adiciona padding interno ao redor do conteúdo */
    }
    .product p {
        width: 100%;
        overflow: hidden;
        height: 32%;
        font-family: "Raleway";
    }
    .economics {
        font-family: "PT sans";
        font-weight: 800;
    }

    .economics p{
        margin-bottom:10px;
    }

    button,
    select {
        background: #00084d;
        color: white;
        padding: 10px 18px;
        border: none;
        border-radius: 20px;
        font-weight: 700;
        align-items: center;
        gap: 10px;
    }
    button:hover,
    .amount i:hover {
        background-color: #005e8d;
    }

    button i {
        font-size: 1.1rem;
        padding-right: 10px;
    }
    .edit{
        display: flex;
        flex-direction: column;
        width: 100%;
        max-width: 1000px;
        margin: 0 auto;
    }

    .edit h2{
        margin-bottom: 34px;
    }

    form {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        gap: 24px;
        width: 100%;
        max-width: 1000px;
    }

    input {
        height: 40px;
        border: none;
        border-radius: 4px;
    }

    .amount {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .amount i {
        padding: 10px;
        background: #003c5b;
        border-radius: 50%;
    }

    .amount p {
        padding: 0 10px;
    }

    .pop-up-quantity {
        display: flex;
        position: fixed;
        justify-content: center;
        align-items: center;
        top: 0;
        width: 100%;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.6);
    }
    .pop-up {
        display: flex;
        flex-direction: column;
        position: fixed;
        justify-content: space-evenly;
        align-items: center;
        background-color: #000846;
        border-radius: 4px;
        text-align: center;
        width: 30%;
        height: 70%;
        padding: 20px;
    }
    img {
        max-width: 100px;
        max-height: 100px;
        object-fit: cover;
        border-radius: 4px;
    }

    @media (max-width: 1024px) {
        .listProductsContainer {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    @media (max-width: 768px) {
        .listProductsContainer {
            grid-template-columns: 1fr;
        }
    }
</style>
