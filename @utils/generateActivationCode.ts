function generateActivationCode() {
    let code = Math.floor(Math.random() * 1000000) + 1;
    return code;
}

export default generateActivationCode;