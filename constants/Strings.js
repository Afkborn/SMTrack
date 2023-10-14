module.exports = {
    NOT_AUTH    :   "Kayıtlı olmadığın için mesajlarını okuyamıyorum. /start komutu ile kayıt olabilirsin.",
    ALREADY_SAVED   :   (days,username) => `Seni zaten ${days} gündür tanıyorum ${username} :)`,
    SAVE_SUCCESS    :   "Başarıyla kayıt oldun.",
    NEW_BULTEN_MESSAGE  :   (bultenNo, bultenHref) => `Yeni bülten geldi! Bülten No: ${bultenNo} bültene ulaşmak için  [tıklayın](${bultenHref})`,
    LAST_BULTEN_MESSAGE :   (bultenNo, bultenHref) => `Son bülteni gönderiyorum. Bülten No: ${bultenNo} bültene ulaşmak için  [tıklayın](${bultenHref})`,
    BULTEN_NOT_FOUND    :   "Böyle bir bülten bulunamadı. Bülten numarasını YYYY-AA şeklinde giriniz, örneğin 2023-60",
};
