<?
$name = $_POST['name'];
$phone = $_POST['tel'];
$email = $_POST['email'];
$message = $_POST['message'];

require_once 'PHPMailerAutoload.php';

$mail = new PHPMailer;
$mail->CharSet = 'UTF-8';

// $mail->SMTPDebug = 3;                             	// Enable verbose debug output

$mail->isSMTP();                                    	// Set mailer to use SMTP
$mail->Host = 'smtp.gmail.com';  						// Specify main and backup SMTP servers
$mail->SMTPAuth = true;                             	// Enable SMTP authentication
$mail->Username = 'some@gmail.com';              	// Наш логин
$mail->Password = 'password';                       	// Наш пароль от ящика
$mail->SMTPSecure = 'ssl';                          	// Enable TLS encryption, `ssl` also accepted
$mail->Port = 465;                                  	// TCP port to connect to
 
$mail->setFrom('some@gmail.com');   					// От кого письмо, тема письма 
$mail->addAddress('some@list.ru');     			// Адрес получателя
//$mail->addAddress('rva@richv.ru');               		// Name is optional
//$mail->addReplyTo('info@example.com', 'Information');
//$mail->addCC('cc@example.com');
//$mail->addBCC('bcc@example.com');
//$mail->addAttachment('/var/tmp/file.tar.gz');         // Add attachments
//$mail->addAttachment('/tmp/image.jpg', 'new.jpg');    // Optional name


// Тело письма
$mail->Subject = 'Данные с формы';
$mail->isHTML(true); 				
$mail->Body = '
		Пользователь оставил данные <br> 
		Имя:&nbsp; ' . $name . ' <br>
		Номер телефона:&nbsp; ' . $phone . '<br>
		E-mail:&nbsp; ' . $email . ' <br>
		<br>
		Сообщение:&nbsp; ' . $message . '';

//$mail->msgHTML($body);

// Приложения
if ($_FILES){
	foreach ( $_FILES['file']['tmp_name'] as $key => $value ) {
		$mail->addAttachment($value, $_FILES['file']['name'][$key]);
	}
}

if(!$mail->send()) {
    return false;
} else {
    return true;
}

$mail->send();
?>