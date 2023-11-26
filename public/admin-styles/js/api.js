function toggleUser(userId) {
    $.ajax({
        url: `/admin/blockuser?id=${userId}`,
        method: 'get',
        success: () => {
            location.reload();
        }
    })
}

function changeProdStatus(OrderId, proId, status,) {
    $.ajax({
        url: `/admin/prodStatus?order=${OrderId}`,
        method: 'put',
        data: {
            product: proId,
            change: status
        },
        success: (res) => {
            // console.log(res);
            location.reload();
        }
    })

}

function editImag(e, img) {
    document.getElementById(`edit-${img}`).src = URL.createObjectURL(e.target.files[0])
}

async function updateProduct(e) {
    e.preventDefault();
    const form = e.target;
    const overlayElement = document.getElementById('overlay');
    const loadingElement = document.getElementById('loading');

    overlayElement.style.display = 'block'; // Show overlay
    loadingElement.style.display = 'block'; // Show spinner
    const productName = form.querySelector('#product_name').value;
    const productDescription = form.querySelector('input[name="description"]').value;
    const productPrice = form.querySelector('input[name="price"]').value;
    const productCategory = form.querySelector('select[name="category"]').value;
    const productStock = form.querySelector('input[name="stock"]').value;
    const id = form.querySelector('#_id').value;
    const formData = new FormData();
    formData.append('productName', productName);
    formData.append('productDescription', productDescription);
    formData.append('productPrice', productPrice);
    formData.append('productCategory', productCategory);
    formData.append('productStock', productStock);
    const imageInputs = form.querySelectorAll('input[name="image"]');
    for (let i = 0; i < 5; i++) {
        const input = imageInputs[i];
        let imageFile = i;
        if (input.files.length > 0) {
            imageFile = input.files[0];
        }
        formData.append('image', imageFile);
    }

    try {
        const response = await fetch(`/admin/productedit?id=${id}`, {
            method: 'PUT',
            body: formData
        });

        if (response.ok) {
            // console.log(await response.json());
            overlayElement.style.display = 'none'; // Hide overlay
            loadingElement.style.display = 'none'; // Hide spinner
            location.href = '/admin/products';
        } else {
            // console.log('Error:', response.status);
            // location.href = '/admin/products';
        }
        overlayElement.style.display = 'none'; // Hide overlay
        loadingElement.style.display = 'none'; // Hide spinner
    } catch (error) {
        // console.log('Error:', error);
        // location.href = '/admin/products';
    }
}

async function updateCategory(e) {
    e.preventDefault();
    const form = e.target;
    const categoryName = form.querySelector('#category_name').value;
    const id = form.querySelector('#_id').value;
    const formData = new FormData();
    formData.append('categoryName', categoryName);
    const imageInput = form.querySelector('input[name="cat_image"]');
    let imageFile = null;
    if (imageInput.files.length > 0) {
        imageFile = imageInput.files[0];
    }
    formData.append('image', imageFile);
    try {
        const response = await fetch(`/admin/categoryedit?id=${id}`, {
            method: 'PUT',
            body: formData
        });

        if (response.ok) {
            // console.log(await response.json());
            location.href = '/admin/categories';
        } else {
            // console.log('Error:', response.status);
            // location.href = '/admin/products';
        }
    } catch (error) {
        console.log('Error:', error);
        // location.href = '/admin/products';
    }
}

function deleteCategory(id, name) {
    // console.log(id, name)
    Swal.fire({
        title: `Are you sure you want to delete Category ${name}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `/admin/deletecategory?id=${id}`,
                get: 'get',
                success: (res) => {
                    Swal.fire(
                        'Deleted!',
                        `Category ${name} has been deleted.`,
                        'success'
                    )
                    location.reload();
                }
            })
        }
    })
}

function deleteProduct(id, name) {
    // console.log(id, name)
    Swal.fire({
        title: `Are you sure you want to delete Product ${name}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `/admin/deleteproduct?id=${id}`,
                get: 'get',
                success: (res) => {
                    Swal.fire(
                        'Deleted!',
                        `Category ${name} has been deleted.`,
                        'success'
                    )
                    location.reload();
                }
            })
        }
    })
}

async function monthly(event) {
    event.preventDefault();
    const monthSelect = document.getElementById('monthSelect');
    let selectedMonth = monthSelect.value;
    selectedMonth = parseInt(selectedMonth);
    // console.log(selectedMonth)
    $.ajax({
        url: `/admin/monthly?id=${selectedMonth - 1}`,
        method: 'get',
        success: (res) => {
            // console.log(res)
            const tableBody = document.getElementById("myTable").getElementsByTagName("tbody")[0];
            tableBody.innerHTML = "";

            res.forEach((item, index) => {
                const row = document.createElement("tr");

                const slNoCell = document.createElement("td");
                slNoCell.innerText = index + 1;

                const categoryCell = document.createElement("td");
                categoryCell.innerText = item.categoryName;

                const amountCell = document.createElement("td");
                amountCell.innerText = item.totalSaleAmount;

                row.appendChild(slNoCell);
                row.appendChild(categoryCell);
                row.appendChild(amountCell);

                tableBody.appendChild(row);
            });
        }
    })
}

async function datewise(event) {
    event.preventDefault();
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;
    // console.log("Start Date:", startDate);
    // console.log("End Date:", endDate);
    $.ajax({
        url: `/admin/daily?start=${startDate}&end=${endDate}`,
        method: 'get',
        success: (res) => {
            console.log(res)
            const tableBody = document.getElementById("myTable").getElementsByTagName("tbody")[0];
            tableBody.innerHTML = "";

            res.forEach((item, index) => {
                const row = document.createElement("tr");

                const slNoCell = document.createElement("td");
                slNoCell.innerText = index + 1;

                const categoryCell = document.createElement("td");
                categoryCell.innerText = item.categoryName;

                const amountCell = document.createElement("td");
                amountCell.innerText = item.totalSaleAmount;

                row.appendChild(slNoCell);
                row.appendChild(categoryCell);
                row.appendChild(amountCell);

                tableBody.appendChild(row);
            });
        }
    })
}

function yearly(event) {
    event.preventDefault();
    const year = document.getElementById("yearselect").value;
    // console.log("year:", year);
    $.ajax({
        url: `/admin/yearly?year=${year}`,
        method: 'get',
        success: (res) => {
            // console.log(res)
            const tableBody = document.getElementById("myTable").getElementsByTagName("tbody")[0];
            tableBody.innerHTML = "";

            res.forEach((item, index) => {
                const row = document.createElement("tr");

                const slNoCell = document.createElement("td");
                slNoCell.innerText = index + 1;

                const categoryCell = document.createElement("td");
                categoryCell.innerText = item.categoryName;

                const amountCell = document.createElement("td");
                amountCell.innerText = item.totalSaleAmount;

                row.appendChild(slNoCell);
                row.appendChild(categoryCell);
                row.appendChild(amountCell);

                tableBody.appendChild(row);
            });
        }
    })
}

async function changeBanner(e) {
    e.preventDefault();
    const form = e.target;
    const banner_name = form.querySelector('#banner_name').value;
    const id = form.querySelector('#_id').value;
    const formData = new FormData();
    formData.append('text', banner_name);
    const imageInput = form.querySelector('input[name="ban_image"]');
    const prod_id = document.getElementById('product_banner').value;
    formData.append('id', prod_id);
    let imageFile = null;
    if (imageInput.files.length > 0) {
        imageFile = imageInput.files[0];
    }
    formData.append('image', imageFile);
    try {
        const response = await fetch(`/admin/banner?id=${id}`, {
            method: 'PUT',
            body: formData
        });

        if (response.ok) {
            // console.log(await response.json());
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Banner Updated',
                showConfirmButton: false,
                timer: 1500
            })
            location.href = '/admin/dashboard';
        } else {
            console.log('Error:', response.status);
            // location.href = '/admin/products';
        }
    } catch (error) {
        console.log('Error:', error);
        // location.href = '/admin/products';
    }
}

async function refundUser(user, amount, orderId, productId, username, useremail, usermobile) {
    // console.log(user, amount, orderId, productId, username, useremail, usermobile);
    $.ajax({
        url: '/admin/refund_initiate',
        method: 'post',
        data: {
            user,
            amount,
            orderId,
            productId
        },
        success: (res) => {
            // console.log(res)
        },
        error: (err) => {
            location.href = '/checkoutfailed'
        }
    })
    // const keyResponse = await fetch('http://localhost:4000/getKey');
    const keyResponse = await fetch('https://techspire.onrender.com/getKey');
    const { key } = await keyResponse.json();
    // const orderResponse = await fetch('http://localhost:4000/admin/rzp_refund',
    const orderResponse = await fetch('https://techspire.onrender.com/admin/rzp_refund',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ amount }),
        });
    // console.log(orderResponse)
    const { order } = await orderResponse.json();
    const options = {
        key: key,
        amount: order.amount,
        currency: "INR",
        name: "TechSpire",
        description: "Computer Store",
        image: `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_qGIao9fWhudsdB__ubCggzeVyCkgLiHAMA&usqp=CAU`,
        order_id: order.id,
        // callback_url: `http://localhost:4000/admin/refund_verification`,
        callback_url: `https://techspire.onrender.com/admin/refund_verification`,
        prefill: {
            "name": username,
            "email": useremail,
            "contact": `+91${usermobile}`
        },
        notes: {
            "address": "TechSpire Corporate Office"
        },
        theme: {
            "color": "#030505"
        }
    };
    const rzp1 = new window.Razorpay(options);
    rzp1.open()
}
