module.exports = {
    NOT_AUTH    :   "Kayıtlı olmadığın için mesajlarını okuyamıyorum. /kayit komutu ile kayıt olabilirsin.",
    ALREADY_AUTH   :   (days,username) => `Seni zaten ${days} gündür tanıyorum ${username} :)`,
    SAVE_SUCCESS    :   "Başarıyla kayıt oldun.",
    NEW_BULTEN_MESSAGE  :   (bultenNo, bultenHref) => `Yeni SPK bülteni yayınlandı! Bülten No: ${bultenNo} ulaşmak için [tıklayın](${bultenHref})`,
    LAST_BULTEN_MESSAGE :   (bultenNo, bultenHref) => `${bultenNo} numaralı SPK bültene ulaşmak için [tıklayın](${bultenHref})`,
    BULTEN_NOT_FOUND    :   "Böyle bir bülten bulunamadı. Bülten numarasını YYYY-AA şeklinde giriniz, örneğin 2023-60",
    AUTH_SUCCESS    :   "Başarıyla kayıt oldun.",
    AUTH_FAIL   :   "Kayıt olurken bir hata oluştu.",
};
