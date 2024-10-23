#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Tue Jul 16 11:02:35 2024

@author: pratikdani
"""

import requests
import random
import uuid
import json

# AUTH_BASE_URL = ""
AUTH_BASE_URL = "https://www.linkedin.com"

REQUEST_HEADERS = {
    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36",
    "User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36",
}

def generate_trackingId_as_charString() -> str:
    """Generates and returns a random trackingId

    :return: Random trackingId string
    :rtype: str
    """
    random_int_array = [random.randrange(256) for _ in range(16)]
    rand_byte_array = bytearray(random_int_array)
    return "".join([chr(i) for i in rand_byte_array])


def get_session(li_at):
    s = requests.session()
    response = requests.get(rf"{AUTH_BASE_URL}/uas/authenticate")
    s.cookies = response.cookies
    s.cookies['li_at'] = li_at
    s.headers = REQUEST_HEADERS
    s.headers["csrf-token"] = s.cookies["JSESSIONID"].strip('"')
    sess = s
    return sess

message_body = ""

message_event = {
            "eventCreate": {
                "originToken": str(uuid.uuid4()),
                "value": {
                    "com.linkedin.voyager.messaging.create.MessageCreate": {
                        "attributedBody": {
                            "text": message_body,
                            "attributes": [],
                        },
                        "attachments": [],
                    }
                },
                "trackingId": generate_trackingId_as_charString(),
            },
            "dedupeByClientGeneratedToken": False,
        }


recipients = ["ACoAABUxe6UBkuqyD89cw2XWUCxvJRkqmzomfz4"]
message_event["recipients"] = recipients
message_event["subtype"] = "MEMBER_TO_MEMBER"
payload = {
    "keyVersion": "LEGACY_INBOX",
    "conversationCreate": message_event,
}

li_at = "AQEDAT1hHu4Alx0_AAABkLoTvZ0AAAGQ3iBBnU0AwsvpufPZ4YjsqYQAIP4fz2iahweXVNCyCQxOllIppSNj5RZ0KVc_yFMP3tkiuqItslu4JA9gPjddLPqqVmOPi_1E3GKnIZmOGZhzJ6Cx3SB8FNRN"

sess = get_session(li_at)
params = {"action": "create"}
res = sess.post(
    f"{AUTH_BASE_URL}/messaging/conversations",
    params=params,
    data=json.dumps(payload),
)