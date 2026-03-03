fetch('http://localhost:3000/api/usuarios/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        fullName: "Test User React",
        email: "testreact" + Date.now() + "@test.com",
        password: "Password123!",
        rol: "ESTUDIANTE",
        career: "Ingeniería de Sistemas",
        gender: "Masculino",
        documentNumber: "123456789",
        documentType: "CC"
    })
}).then(res => res.json()).then(console.log).catch(console.error);
