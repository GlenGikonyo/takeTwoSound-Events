const bookingSendMail = () => {
    const selectedOptionElement = document.getElementById("select");
    const selectedOptionText = selectedOptionElement.options[selectedOptionElement.selectedIndex].text;

    const params = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        phone_number: document.getElementById("phone_number").value,
        select: selectedOptionText, // Retrieve the selected option's text
        date: document.getElementById("date").value,
        message: document.getElementById("message").value
    };

    const serviceID = "service_j3v280r";
    const templateID = "template_kdaktvk";

    emailjs.send(serviceID, templateID, params)
        .then(
            res => {
                // Clear form fields after successful submission
                document.getElementById("name").value = "";
                document.getElementById("email").value = "";
                document.getElementById("phone_number").value = "";
                selectedOptionElement.value = ""; // Clear the select field
                document.getElementById("date").value = "";
                document.getElementById("message").value = "";

                console.log(res);
                alert("Your message sent successfully");
            }
        )
        .catch(err => console.log(err));
};
