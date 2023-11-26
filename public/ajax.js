function successNotification(message) {
    new Noty({
        type: 'success',
        text: message,
        timeout: 3000,
        progressBar: true,
        closeWith: ['click', 'button'],
        theme: 'bootstrap-v4',
        layout: 'topCenter',
    }).show();
}

function errorNotification(message) {
    new Noty({
        type: 'error',
        text: message,
        timeout: 2000,
        layout: 'topCenter',
    }).show();
}

const addToCart = (proId) => {
    // console.log(proId)
    const cartCount = document.getElementById('cartcount').innerHTML;
    // console.log(cartCount);
    $.ajax({
        url: `/addtocart?id=${proId}`,
        method: 'get',
        success: (respo) => {
            if (respo.count > cartCount) document.getElementById('cartcount').innerHTML = respo.count;
            successNotification('Product added to cart successfully!');
        }
    })
}

function removeProd(proId) {
    // console.log('remove product func ', proId)
    $.ajax({
        url: `/removeCartProd?proId=${proId}`,
        method: 'get',
        success: (res) => {
            errorNotification('product removed from cart')
            location.reload();
        }
    })
}


function changeQuantity(proId, cartId, prodPrice, count) {
    let current = document.getElementById(`quantity-${proId}`).textContent;
    // console.log(current);
    // console.log(parseInt(current) + parseInt(count));
    if ((parseInt(current) + parseInt(count)) == 0) return removeProd(proId);
    else {
        $.ajax({
            url: `/updateCart?cartId=${cartId}&proId=${proId}&count=${count}`,
            method: 'get',
            data: {
                cartId,
                proId,
                count
            },
            success: (respo) => {
                // console.log(respo);
                const stockMessageElement = document.getElementById('stockmessage');
                if (respo === 'max') {
                    stockMessageElement.innerHTML = 'Maximum stock reached';
                } else {
                    stockMessageElement.innerHTML = '';
                    document.getElementById(`quantity-${proId}`).textContent = respo;
                    const price = parseInt(prodPrice);
                    const subtotal = respo * price;
                    if (!isNaN(subtotal)) {
                        document.getElementById(`subtotal-${proId}`).textContent = `₹${subtotal}`;
                    }
                    let total = document.getElementById('total-amount').textContent;
                    total = total.replace(/[^0-9]/g, '');
                    total = parseInt(total);
                    // console.log(total);
                    if (count < 0) {
                        total -= parseInt(prodPrice);
                    } else {
                        total += parseInt(prodPrice);
                    }
                    document.getElementById('total-amount').textContent = `₹${total}`;
                }
            }
        });
    }
}


async function checkoutCoupon(event) {
    event.preventDefault();

    const form = document.getElementById('couponForm');

    const formData = new FormData(form);

    const couponCode = formData.get('coupon');
    const userId = formData.get('user');
    const amount = formData.get('amount');
    const couponApplied = formData.get('couponApplied');
    const couponAmount = formData.get('couponAmount');
    // console.log(couponCode);
    // console.log(userId);
    // console.log(amount);
    // console.log(couponApplied);
    // console.log(couponAmount);
    $.ajax({
        url: '/couponcheck',
        method: 'post',
        data: {
            user: userId,
            coupon: couponCode,
            amount
        },
        success: (res) => {
            // console.log(res);
            const couponSection = document.getElementById('couponSection');
            const responseMessage = document.getElementById('responseMessage');
            if (Array.isArray(res.message)) {
                const couponAmountField = document.getElementById('couponAmountField');
                couponAmountField.value = parseFloat(res.message[0]);
                let checkoutamount = document.getElementById('checkout-amount').innerHTML;
                checkoutamount = checkoutamount.replace(/[^0-9]/g, '');
                checkoutamount = parseInt(checkoutamount);
                document.getElementById('checkout-amount').innerHTML = checkoutamount - res.message[0];
                // couponSection.style.display = 'none';
                responseMessage.innerHTML = 'Coupon applied successfully!';
                responseMessage.style.display = 'block';


            } else {
                const couponAmountField = document.getElementById('couponAmountField');
                couponAmountField.value = 0;
                // couponSection.style.display = 'none';
                responseMessage.innerHTML = res.message;
                responseMessage.style.display = 'block';
            }
        }
    })
}

const place_order = async (event) => {
    event.preventDefault();
    const userId = document.querySelector('input[name="user"]').value;
    // const deliveryaddress = document.querySelector('input[name="address"]').value;
    const deliveryAddressInputs = document.querySelectorAll('input[name="address"]');
    let deliveryaddress = '';
    deliveryAddressInputs.forEach((input) => {
        if (input.checked) {
            deliveryaddress = input.value;
        }
    });
    // console.log(deliveryaddress);
    let couponDiscount = document.getElementById('couponAmountField').value;
    const coupon = document.querySelector('input[name="coupon"]').value;
    const paymentMethod = document.querySelector('input[name="payment_method"]:checked').value;
    let username = '';
    let usermobile = '';
    let useremail = '';
    couponDiscount = parseInt(couponDiscount);
    // console.log('this is coupon ', couponDiscount, typeof (couponDiscount), coupon);
    if (couponDiscount !== 0) {
        $.ajax({
            url: '/checkout_initiate',
            method: 'post',
            data: {
                address: deliveryaddress,
                userId,
                paymentMethod,
                couponApplied: true,
                coupon,
                couponAmount: couponDiscount
            },
            success: (res) => {
                username = res.name;
                usermobile = res.contact;
                useremail = res.email;
            },
            error: (err) => {
                location.href = '/checkoutfailed'
            }
        })
    } else {
        $.ajax({
            url: '/checkout_initiate',
            method: 'post',
            data: {
                address: deliveryaddress,
                userId,
                paymentMethod,
                couponApplied: false,
                coupon: null,
                couponAmount: 0
            },
            success: (res) => {
                username = res.name;
                usermobile = res.contact;
                useremail = res.email;
            },
            error: (err) => {
                location.href = '/checkoutfailed'
            }
        })
    }
    let checkoutamount = document.getElementById('checkout-amount').innerHTML;
    checkoutamount = checkoutamount.replace(/[^0-9]/g, '');
    checkoutamount = parseInt(checkoutamount);
    checkoutamount = couponDiscount ? checkoutamount - couponDiscount : checkoutamount
    if (paymentMethod === 'razorpay') {
        // const keyResponse = await fetch('http://localhost:4000/getKey');
        const keyResponse = await fetch('https://techspire.onrender.com/getKey');
        const { key } = await keyResponse.json();
        // const orderResponse = await fetch('http://localhost:4000/rzp_checkout', 
        const orderResponse = await fetch('https://techspire.onrender.com/rzp_checkout',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ amount: checkoutamount }),
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
            // callback_url: `http://localhost:4000/rzp_verification`,
            callback_url: `https://techspire.onrender.com/rzp_verification`,
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
    } else if (paymentMethod === 'paypal') {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/paypal_checkout';
        const submitButton = document.createElement('input');
        submitButton.type = 'submit';
        submitButton.value = 'Pay with PayPal';
        form.appendChild(submitButton);
        document.body.appendChild(form);
        form.submit();
    }
    else if (paymentMethod === 'cod') {
        $.ajax({
            url: `/cod`,
            method: 'get',
            success: (res) => {
                // console.log(res)
                location.href = 'payment_success'
            }
        })
    }
}

async function changeOrderProdStatus(prodId, orderId, change) {
    // console.log(prodId, orderId, change);
    $.ajax({
        url: `/prodStatus?order=${orderId}`,
        method: `put`,
        data: {
            product: prodId,
            change
        },
        success: (res) => {
            // console.log(res);
        }
    })

}

// (
//     function (){
//      var total = parseInt(document.getElementById("totalAmount").innerText)
//      var elem = document.getElementById("userWallet")
//      var userWallet = elem.getAttribute("value")
//      console.log(total,userWallet);
//      console.log(typeof(total));
//      if (total>userWallet){
//         document.getElementById("walletErr").innerText='Wallet Amount Insufficient to make payment'
//         document.getElementById("wallet").disabled = true;
//         setTimeout("document.getElementById('walletErr').style.display='none';", 3000);
//      }
//     }
// )();

async function addAddress(e) {
    e.preventDefault();
    const customerName = document.getElementById('Contactname').value;
    const contactNumber = document.getElementById('contactNumber').value;
    const email = document.getElementById('email').value;
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;
    const pincode = document.getElementById('pincode').value;

    const nameError = document.getElementById('name-error');
    const mobileError = document.getElementById('mobile-error');
    const emailError = document.getElementById('email-error');
    const addressError = document.getElementById('address-error');
    const countryError = document.getElementById('country-error');
    const pinError = document.getElementById('pin-error');

    nameError.textContent = '';
    mobileError.textContent = '';
    emailError.textContent = '';
    addressError.textContent = '';
    countryError.textContent = '';
    pinError.textContent = '';

    if (customerName.trim() === '') {
        nameError.textContent = 'Please enter a valid name';
        return;
    }

    if (!contactNumber.match(/^\d{10}$/)) {
        mobileError.textContent = 'Please enter a valid contact number';
        return;
    }

    if (!email.match(/^[a-zA-Z0-9.!#$%&’+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)$/)) {
        emailError.textContent = 'Please enter a valid email address';
        return;
    }

    if (city.trim() === '') {
        addressError.textContent = 'Please enter a valid city';
        return;
    }

    if (state.trim() === '') {
        countryError.textContent = 'Please enter a valid state';
        return;
    }

    if (pincode.trim() === '') {
        pinError.textContent = 'Please enter a valid pin code';
        return;
    }
    const userId = document.querySelector('input[name="userId"]').value;
    const formAction = document.querySelector('input[name="action"]').value;
    if (formAction == 'add') {
        $.ajax({
            url: `/address?id=${userId}`,
            method: 'put',
            data: {
                customername: customerName,
                contactnumber: contactNumber,
                customeremail: email,
                city,
                state,
                pincode
            },
            success: (res) => {
                location.reload()
            }
        })
    } else {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const id = urlParams.get('id');
        $.ajax({
            url: `/address?id=${id}`,
            method: 'patch',
            data: {
                customername: customerName,
                contactnumber: contactNumber,
                customeremail: email,
                city,
                state,
                pincode
            },
            success: (res) => {
                Swal.fire(
                    'Updated!',
                    res,
                    'success'
                )
                location.reload()
            }
        })
    }
}

function deleteAddress(addrId) {
    Swal.fire({
        title: `Are you sure you want to delete this address ?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `/address?id=${addrId}`,
                method: 'delete',
                success: (res) => {
                    // console.log(res)
                    Swal.fire(
                        'Deleted!',
                        `The address has been deleted.`,
                        'success'
                    )
                    location.reload();
                }
            })
        }
    })
}

function requestOTP(mobile) {
    document.getElementById('mobilereq_error').textContent = ' ';
    $.ajax({
        url: `/otp?phonenumber=${mobile}`,
        method: 'get',
        success: (response) => {
            // console.log(response)
            if (response !== 'unregistered' && response !== '') {
                document.getElementById('otp_input').style.display = 'block';
                document.getElementById('send_otp').style.display = 'block';
            } else {
                document.getElementById('mobilereq_error').textContent = 'Mobile number not registered';
                document.getElementById('otp_input').style.display = 'none';
                document.getElementById('send_otp').style.display = 'none';
            }
        },
        error: function (error) {
            console.error('Error occurred during user validation:', error);
        }
    });
}

function verifyOTP(mobile, code) {
    $.ajax({
        url: `/verify?phonenumber=${mobile}&code=${code}`,
        method: 'get',
        success: (res) => {
            // console.log(res);
            if (res === 'verified') {
                location.href = '/'
            } else {
                document.getElementById('invalid_error').textContent = 'OTP not correct';
            }
        }
    })
}

function editProfile(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const usermobile = document.getElementById('usermobile').value;
    const useremail = document.getElementById('useremail').value;
    const userpassword = document.getElementById('userpassword').value;

    const nameError = document.getElementById('name-error');
    const mobileError = document.getElementById('mobile-error');
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');

    nameError.textContent = '';
    mobileError.textContent = '';
    emailError.textContent = '';
    passwordError.textContent = '';

    if (username.trim() === '') {
        nameError.textContent = 'Please enter a valid name';
        return;
    }

    if (!usermobile.match(/^\d{10}$/)) {
        mobileError.textContent = 'Please enter a valid contact number';
        return;
    }

    if (!useremail.match(/^[a-zA-Z0-9.!#$%&’+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)$/)) {
        emailError.textContent = 'Please enter a valid email address';
        return;
    }

    if (userpassword.trim() === '') {
        passwordError.textContent = 'Please enter a valid city';
        return;
    }
    const userId = document.querySelector('input[name="userId"]').value;
    $.ajax({
        url: `/updateprofile?id=${userId}`,
        method: 'put',
        data: {
            username,
            useremail,
            usermobile,
            userpassword
        },
        success: (res) => {
            location.href = '/account'
        }
    })
}

function invoice(args) {
    const argData = JSON.parse(args)
    const companyName = 'Techspire Inc.';
    const orderId = '#' + argData[0]._id;
    const orderDate = new Date(argData[0].orderDate).toDateString().slice(4, 15);
    const data = argData
    const addr=argData[0].deliveryAddress.split(',');
    const products = data.map(item => {
        return {
            name: item.result.name,
            price: '₹' + item.result.price,
            quantity: item.products.quantity.toString(),
            subtotal: '₹' + (item.result.price * item.products.quantity)
        };
    });
    const totalAmount = argData[0].totalAmount;
    const orderAmount = argData[0].amount;
    const couponName = argData[0].coupon;
    const couponAmount = argData[0].couponAmount;
    const content = [
        { text: companyName, style: 'header' },
        { text: 'Order ID: ' + orderId, style: 'subheader' },
        { text: 'Order Date: ' + orderDate, style: 'subheader' },
        { text: 'Shipped To -', style: 'subheader' },
        { text: `${addr[0]}\n+91-${addr[1]}\n${addr[2]}\n${addr[3]}\n${addr[4]}\n${addr[5]}`, margin: [0, 0, 0, 10] },
        { text: 'Products', style: 'subheader' },
        {
            table: {
                headerRows: 1,
                widths: ['*', 'auto', 'auto', 'auto'],
                body: [
                    ['Item', 'Price', 'Quantity', 'Subtotal'],
                    ...products.map(product => [product.name, product.price, product.quantity, product.subtotal])
                ]
            }
        },
        { text: 'Total: ₹' + totalAmount, style: 'total' }
    ];

    if (totalAmount !== orderAmount) {
        content.push({ text: 'Coupon: ' + couponName, style: 'coupon' });
        content.push({ text: 'Coupon Amount: ₹' + couponAmount, style: 'coupon' });
    }

    const documentDefinition = {
        content: content,
        styles: {
            header: { fontSize: 20, bold: true, alignment: 'center', margin: [0, 0, 0, 20] },
            subheader: { fontSize: 14, italics: true, margin: [0, 10, 0, 5] },
            tableHeader: { fontSize: 12, bold: true, fillColor: '#EEEEEE', margin: [0, 5, 0, 5] },
            total: { fontSize: 14, bold: true, alignment: 'right', margin: [0, 20, 0, 0] },
            coupon: { fontSize: 12, margin: [0, 5, 0, 5] }
        }
    };

    pdfMake.createPdf(documentDefinition).open();
}
