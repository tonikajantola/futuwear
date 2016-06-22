#ifndef __IWRAPPER_H
#define __IWRAPPER_H

#define PLATFORM_ARDUINO_UNO    // also Pro Mini and other ATMega328-based boards
#include <iWRAP.h>
#include <AltSoftSerial.h>

#define HOST_BAUD                   38400   // works with 8MHz CPU clock
#define IWRAP_BAUD                  38400   // works with 8MHz CPU clock (REQUIRES iWRAP RECONFIGURATION, DEFAULT IS 115200)
#define MODULE_RESET_PIN            12      // optional connection for MCU-based module reset

// -------- iWRAP configuration definitions --------
// COPY TO TOP OF "iWRAP.h" TO APPLY TO THIS PROGRAM
// OR ELSE ALL FEATURES ENABLED DUE TO BUILD SYSTEM
// -------------------------------------------------
#define IWRAP_DEBUG
#define IWRAP_INCLUDE_RSP_CALL
#define IWRAP_INCLUDE_RSP_LIST_COUNT
#define IWRAP_INCLUDE_RSP_LIST_RESULT
#define IWRAP_INCLUDE_RSP_SET
#define IWRAP_INCLUDE_EVT_CONNECT
#define IWRAP_INCLUDE_EVT_NO_CARRIER
#define IWRAP_INCLUDE_EVT_PAIR
#define IWRAP_INCLUDE_EVT_READY
#define IWRAP_INCLUDE_EVT_RING
#define IWRAP_CONFIGURED
#define IWRAP_INCLUDE_RXDATA
// -------------------------------------------------

#define IWRAP_STATE_IDLE            0
#define IWRAP_STATE_UNKNOWN         1
#define IWRAP_STATE_PENDING_AT      2
#define IWRAP_STATE_PENDING_SET     3
#define IWRAP_STATE_PENDING_LIST    4
#define IWRAP_STATE_PENDING_CALL    5
#define IWRAP_STATE_COMM_FAILED     255

#define IWRAP_MAX_PAIRINGS          16

// connection map structure
typedef struct {
    iwrap_address_t mac;
    uint8_t active_links;
    uint8_t link_a2dp1;
    uint8_t link_a2dp2;
    uint8_t link_avrcp;
    uint8_t link_hfp;
    uint8_t link_hfpag;
    uint8_t link_hid_control;
    uint8_t link_hid_interrupt;
    uint8_t link_hsp;
    uint8_t link_hspag;
    uint8_t link_iap;
    uint8_t link_sco;
    uint8_t link_spp;
    // other profile-specific link IDs may be added here
} iwrap_connection_t;

// iWRAP callbacks necessary for application
void my_iwrap_rsp_call(uint8_t link_id);
void my_iwrap_rsp_list_count(uint8_t num_of_connections);
void my_iwrap_rsp_list_result(uint8_t link_id, const char *mode, uint16_t blocksize, uint32_t elapsed_time, uint16_t local_msc, uint16_t remote_msc, const iwrap_address_t *addr, uint16_t channel, uint8_t direction, uint8_t powermode, uint8_t role, uint8_t crypt, uint16_t buffer, uint8_t eretx);
void my_iwrap_rsp_set(uint8_t category, const char *option, const char *value);
void my_iwrap_evt_connect(uint8_t link_id, const char *type, uint16_t target, const iwrap_address_t *address);
void my_iwrap_evt_no_carrier(uint8_t link_id, uint16_t error_code, const char *message);
void my_iwrap_evt_pair(const iwrap_address_t *address, uint8_t key_type, const uint8_t *link_key);
void my_iwrap_evt_ready();
void my_iwrap_evt_ring(uint8_t link_id, const iwrap_address_t *address, uint16_t channel, const char *profile);

// general helper functions
uint8_t find_pairing_from_mac(const iwrap_address_t *mac);
uint8_t find_pairing_from_link_id(uint8_t link_id);
void add_mapped_connection(uint8_t link_id, const iwrap_address_t *addr, const char *mode, uint16_t channel);
uint8_t remove_mapped_connection(uint8_t link_id);
void print_connection_map();
void print_demo_menu();
void process_demo_choice(char b);

// platform-specific helper functions
int serial_out(const char *str);
int serial_out(const __FlashStringHelper *str);
int iwrap_out(int len, unsigned char *data);

void iwrapper_setup();
void iwrapper_loop();

#endif
