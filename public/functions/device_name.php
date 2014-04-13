<?php
require_once 'Mobile_Detect.php';

function is_mobile($userAgent)
{
	$detect = new Mobile_Detect();
	$detect->setUserAgent($userAgent);
	$result = $detect->isMobile();
	if (!$result) {
		$result = $detect->isTablet();
	}
	return $result;
}

function get_device_name($userAgent) 
{
	$detect = new Mobile_Detect();
	$detect->setUserAgent($userAgent);
	$deviceType = ($detect->isMobile() ? ($detect->isTablet() ? 'tablet' : 'cell') : 'computer');

	if ($deviceType == 'computer') {
		return  $deviceType;
	}

	$name = 'unknow';
	do {
		if ($detect->isiPhone()) {$name = 'iPhone'; break;}
		if ($detect->isBlackBerry()) {$name = 'BlackBerry'; break;}
		if ($detect->isHTC()) {$name = 'HTC'; break;}
		if ($detect->isNexus()) {$name = 'Nexus'; break;}
		if ($detect->isDell()) {$name = 'Dell'; break;}
		if ($detect->isMotorola()) {$name = 'Motorola'; break;}
		if ($detect->isSamsung()) {$name = 'Samsung'; break;}
		if ($detect->isLG()) {$name = 'LG'; break;}
		if ($detect->isSony()) {$name = 'Sony'; break;}
		if ($detect->isAsus()) {$name = 'Asus'; break;}
		if ($detect->isPalm()) {$name = 'Palm'; break;}
		if ($detect->isVertu()) {$name = 'Vertu'; break;}
		if ($detect->isPantech()) {$name = 'Pantech'; break;}
		if ($detect->isFly()) {$name = 'Fly'; break;}
		if ($detect->isSimValley()) {$name = 'SimValley'; break;}
		if ($detect->isGenericPhone()) {$name = 'Generic'; break;}
		if ($detect->isiPad()) {$name = 'iPad'; break;}
		if ($detect->isNexusTablet()) {$name = 'Nexus'; break;}
		if ($detect->isSamsungTablet()) {$name = 'Samsung'; break;}
		if ($detect->isKindle()) {$name = 'Kindle'; break;}
		if ($detect->isSurfaceTablet()) {$name = 'Surface'; break;}
		if ($detect->isAsusTablet()) {$name = 'Asus'; break;}
		if ($detect->isBlackBerryTablet()) {$name = 'BlackBerry'; break;}
		if ($detect->isHTCtablet()) {$name = 'HTC'; break;}
		if ($detect->isMotorolaTablet()) {$name = 'Motorola'; break;}
		if ($detect->isNookTablet()) {$name = 'Nook'; break;}
		if ($detect->isAcerTablet()) {$name = 'Acer'; break;}
		if ($detect->isToshibaTablet()) {$name = 'Toshiba'; break;}
		if ($detect->isLGTablet()) {$name = 'LG'; break;}
		if ($detect->isYarvikTablet()) {$name = 'Yarvik'; break;}
		if ($detect->isMedionTablet()) {$name = 'Medion'; break;}
		if ($detect->isArnovaTablet()) {$name = 'Arnova'; break;}
		if ($detect->isArchosTablet()) {$name = 'Archos'; break;}
		if ($detect->isAinolTablet()) {$name = 'Ainol'; break;}
		if ($detect->isSonyTablet()) {$name = 'Sony'; break;}
		if ($detect->isCubeTablet()) {$name = 'Cube'; break;}
		if ($detect->isCobyTablet()) {$name = 'Coby'; break;}
		if ($detect->isSMiTTablet()) {$name = 'SMiT'; break;}
		if ($detect->isRockChipTablet()) {$name = 'RockChip'; break;}
		if ($detect->isTelstraTablet()) {$name = 'Telstra'; break;}
		if ($detect->isFlyTablet()) {$name = 'Fly'; break;}
		if ($detect->isbqTablet()) {$name = 'bq'; break;}
		if ($detect->isHuaweiTablet()) {$name = 'Huawei'; break;}
		if ($detect->isNecTablet()) {$name = 'Nec'; break;}
		if ($detect->isPantechTablet()) {$name = 'Pantech'; break;}
		if ($detect->isBronchoTablet()) {$name = 'Broncho'; break;}
		if ($detect->isVersusTablet()) {$name = 'Versus'; break;}
		if ($detect->isZyncTablet()) {$name = 'Zync'; break;}
		if ($detect->isPositivoTablet()) {$name = 'Positivo'; break;}
		if ($detect->isNabiTablet()) {$name = 'Nabi'; break;}
		if ($detect->isPlaystationTablet()) {$name = 'Playstation'; break;}
		if ($detect->isGenericTablet()) {$name = 'Generic'; break;}
		if ($detect->isAndroidOS()) {$name = 'Android'; break;}
		if ($detect->isBlackBerryOS()) {$name = 'BlackBerry'; break;}
		if ($detect->isPalmOS()) {$name = 'Plam'; break;}
		if ($detect->isSymbianOS()) {$name = 'Symbian'; break;}
		if ($detect->isWindowsMobileOS()) {$name = 'WindowsMobile'; break;}
		if ($detect->isWindowsPhoneOS()) {$name = 'WindowsPhone'; break;}
		if ($detect->isiOS()) {$name = 'iOS'; break;}
		if ($detect->isMeeGoOS()) {$name = 'MeeGo'; break;}
		if ($detect->isMaemoOS()) {$name = 'Maemo'; break;}
		if ($detect->isJavaOS()) {$name = 'JavaOS'; break;}
		if ($detect->iswebOS()) {$name = 'WebOS'; break;}
		if ($detect->isbadaOS()) {$name = 'badaOS'; break;}
		if ($detect->isBREWOS()) {$name = 'BREWOS'; break;}
	} while(false);

	return $name.' '.$deviceType;
}

?>
